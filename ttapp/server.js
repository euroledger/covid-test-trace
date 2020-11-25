const http = require('http');
const parser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { createTerminus } = require('@godaddy/terminus');
const express = require('express');
const ngrok = require('ngrok');
const cache = require('./model');
const utils = require('./utils');
const crypto = require('crypto');

const debug = require('debug')('tmp:server');

var fs = require('fs');
var https = require('https');
let keydata;
let immunedata;

require('dotenv').config();

// const { AgencyServiceClient, Credentials } = require("@streetcred.id/service-clients");

// const client = new AgencyServiceClient(
//     new Credentials(process.env.ACCESSTOK, process.env.SUBKEY),
//     { noRetryPolicy: true });

const { CredentialsServiceClient, Credentials } = require("@trinsic/service-clients");

const client = new CredentialsServiceClient(
    new Credentials(process.env.ACCESSTOK),
    { noRetryPolicy: true });

var certOptions = {
    key: fs.readFileSync(path.resolve('./cert/server.key')),
    cert: fs.readFileSync(path.resolve('./cert/server.crt'))
}

var app = express();
app.use(cors());
app.use(parser.json());
app.use(express.static(path.join(__dirname, 'build')))


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/build/index.html'));
});

let credentialId;
let connId;
let registered = false;
let loginConfirmed = false;
let credentialAccepted = false;
let verificationAccepted = false;
let name = '';
let connectionAndCredentials;

// WEBHOOK ENDPOINT
app.post('/webhook', async function (req, res) {
    try {
        console.log("got webhook" + req + "   type: " + req.body.message_type);
        if (req.body.message_type === 'new_connection') {

            connId = req.body.object_id;

            console.log("new connection notif, connection = ", req.body);
            try {
                // use the connection contract to get the name for the front end to use
                console.log("Calling getConnection with connection id", connId);
                connectionContract = await getConnectionWithTimeout(connId);
                console.log("--------------->NEW CONNECTION: ", connectionContract);
                name = connectionContract.name;
            } catch (e) {
                console.log(e.message || e.toString());
                return
            }
            registered = true;

            // const attribs = cache.get(req.body.object_id);
            // console.log("attribs from cache = ", attribs);
            // var param_obj = JSON.parse(attribs);


            // var params =
            // {
            //     // credentialOfferParameters: {
            //     definitionId: process.env.CRED_DEF_ID_USER_DETAILS,
            //     connectionId: req.body.object_id,
            //     credentialValues: {
            //         'First Name': param_obj["firstname"],
            //         'Last Name': param_obj["lastname"],
            //         'NHS Patient ID': param_obj["nhsid"],
            //         'NHS Access Key': param_obj["nhskey"]
            //         // }
            //     }
            // }
            // console.log(">>>>>>>>>>>>> Creating credential with params ", params);
            // await client.createCredential(params);
            // console.log("CREDENTIAL CREATED user details!");
        }
        else if (req.body.message_type === 'credential_request') {
            console.log("cred request notif");
            // if (connected) {

            credentialId = req.body.object_id;
            console.log("Issuing credential to wallet, id = ", credentialId);
            await client.issueCredential(credentialId);

            console.log("Credential Issue -> DONE");
            credentialAccepted = true;
            // }
        }
        else if (req.body.message_type === 'verification') {
            console.log("cred verificatation notif");

            console.log(req.body);

            console.log("Getting verification attributes with verification id of ", req.body.object_id);

            let proof = await client.getVerification(req.body.object_id);

            console.log("Proof received; proof data = ", proof);

            // note that isValid field in the proof is whether the proof request is valid or not
            // this is set to false for revoked credentials

            if (template === "key") {
                const data = proof["proof"]["NHS Proof of Key"]["attributes"];

                console.log("----------> received proof request data: ", data);
                keydata = {
                    nhskey: data["NHS Test & Trace Key"],
                };
                connId = keydata.nhskey;
                console.log(keydata);
            } else if (template === "vaccine") {
                const data = proof["proof"]["NHS Covid Vaccination Certificate"]["attributes"];

                console.log("----------> received proof request data: ", data);
                keydata = {
                    certificateId: data["Certificate ID"],
                    name: data["Patient Name"],
                    date: data["Vaccination Date"],
                    centre: data["NHS Vaccine Centre"],
                    type: data["Vaccination Type"] + " Vaccine"
                };
                keydata.isValid = true;

            } else if (template === "positive") {
                const data = proof["proof"]["NHS Covid Test Certificate"]["attributes"];

                console.log("----------> received proof request data: ", data);
                keydata = {
                    certificateId: data["Certificate ID"],
                    name: data["Patient Name"],
                    date: data["Test Date"],
                    centre: data["Test Centre"],
                    type: data["Test Type"],
                    result: data["Test Result"]
                };

                // HACK until i get proof of revocation working
                // pull out all credentials 
                // filter out the one with Certificate ID equal to the one above
                // check  state

                console.log("---------------- GET ALL CREDENTIALS FOR HACK-------------------");

                // retreive all credentials for this id
                let credentials = await client.listCredentials();
                // var issuedCredentialsForThisConnection = credentials.filter(function (credential) {
                //     return credential.connectionId === keydata.nhskey;
                // });

                console.log("******* CREDENTIALS = ", credentials);
                console.log("looking for certificate id ", keydata.certificateId);
                var issuedCredentialsForThisUser = credentials.filter(function (credential) {
                    return credential.values["Certificate ID"] === keydata.certificateId;
                });

                console.log("IMPORTANT ALL credentials = ", issuedCredentialsForThisUser);

                if (issuedCredentialsForThisUser.length >= 1) {
                    console.log(">>>>>>>>>> CREDENTIAL = ", issuedCredentialsForThisUser[0])
                    keydata.isValid = issuedCredentialsForThisUser[issuedCredentialsForThisUser.length - 1].state != "Revoked";
                } 
                else {
                    keydata.isValid = false;
                    console.log(">>>>>>>>>> CREDENIAL NOT FOUND! issuedCredentialsForThisUser = ", issuedCredentialsForThisUser);
                }
            } else {
                const data = proof["proof"]["NHS Verification"]["attributes"];
                console.log("----------> received proof request data: ", data);
                keydata = {
                    nhskey: data["NHS Test & Trace Key"],
                    id: data["NHS Patient Ref"],
                    name: data["Full Name"]
                };
                connId = keydata.nhskey;
                console.log(keydata);

                // pass back test information if present

                try {
                    console.log("---------------- GET ALL CREDENTIALS -------------------");

                    // retreive all credentials for this id
                    let credentials = await client.listCredentials();
                    // var issuedCredentialsForThisConnection = credentials.filter(function (credential) {
                    //     return credential.connectionId === keydata.nhskey;
                    // });

                    console.log("QUACK 1");
                    var issuedCredentialsForThisUser = credentials.filter(function (credential) {
                        return credential.state === "Issued" && credential.values["Test Result"] != undefined && credential.connectionId == keydata.nhskey;
                    });
                    console.log("QUACK 2 issuedCredentialsForThisUser =", issuedCredentialsForThisUser);

                    if (issuedCredentialsForThisUser.length >= 1) {
                        console.log("QUACK 3");
                        keydata.testData = issuedCredentialsForThisUser[issuedCredentialsForThisUser.length - 1].values;
                        credentialId = issuedCredentialsForThisUser[issuedCredentialsForThisUser.length - 1].credentialId;
                        console.log("QUACK >>> credentials = ", issuedCredentialsForThisUser);
                    }

                    console.log("CREDENTIAL keydata = ", keydata);
                }
                catch (e) {
                    console.log(e.message || e.toString());
                }
            }
            verificationAccepted = true;
            // res.status(200).send();

            // } else {

            //     connectionId = proof["proof"]["Login Verification"]["attributes"]["Acme Access Token"];

            //     // verify that the connection record exists for this id
            //     let connectionContract;
            //     try {
            //         connectionContract = await getConnectionWithTimeout(connectionId);
            //     } catch (e) {
            //         console.log(e.message || e.toString());
            //         res.status(500).send("connection record not found for id " + connectionId);
            //     }

            //     if (connectionContract) {
            //         console.log("connectionContract = ", connectionContract);

            //         console.log("---------------- GET ALL CREDENTIALS -------------------");

            //         // retreive all credentials for this id
            //         let credentials = await client.listCredentials();
            //         var issuedCredentialsForThisConnection = credentials.filter(function (credential) {
            //             return credential.connectionId === connectionId;
            //         });
            //         console.log(issuedCredentialsForThisConnection)

            //         var issuedCredentialsForThisUser = credentials.filter(function (credential) {
            //             return credential.state === "Issued" && credential.connectionId === connectionId;
            //         });

            //         // console.log(issuedCredentialsForThisUser);

            //         connectionAndCredentials = {
            //             connectionContract: connectionContract,
            //             credentials: issuedCredentialsForThisUser
            //         }
            //         // save the credential IDs of previously issued credentials -> these can be used for revocation
            //         issuedCredentialsForThisUser.forEach(credential => {
            //             if (credential.values.Platform === "acme") {
            //                 console.log("-> Setting acmeCredentialId to ", credential.credentialId);
            //                 acmeCredentialId = credential.credentialId;
            //             }
            //         });
            //         verificationAccepted = true;
            //         loginConfirmed = true;
            //         // res.status(200).send(connectionAndCredentials);

            //     } else {
            //         console.log("connection record not found for id ", connectionId);
            //         res.status(500);
            //     }
            // }
        } else {
            console.log("WEBHOOK message_type = ", req.body.message_type);
            console.log("body = ", req.body);
        }
    }
    catch (e) {
        console.log("/webhook error: ", e.message || e.toString());
    }
});

// const sendVaccinationCertificateVerification = async () => {
//     const params =
//     {
//         "name": "Proof of Vaccination Certificate",
//         "version": "1.0",
//         "attributes": [
//             {
//                 "policyName": "Proof of Vaccination Certificate",
//                 "attributeNames": [
//                     "Certificate ID",
//                     "Vaccination Date",
//                     "NHS Vaccination Centre"
//                 ],
//                 "restrictions": null
//             }
//         ],
//         "predicates": []
//     }

//     console.log("send verification request, connectionId = ", connId, "; params = ", params);
//     const resp = await client.sendVerificationFromParameters(connId, params);
// }

// const sendCovidCertificateVerification = async () => {

// }

//FRONTEND ENDPOINTS

app.post('/api/patient/issue', cors(), async function (req, res) {

    console.log("IN /api/patient/issue: attributes = ", req.body);
    if (connId) {
        var params =
        {
            definitionId: process.env.CRED_DEF_ID_NHS_PATIENT,
            connectionId: connId,
            credentialValues: {
                "NHS Patient Ref": req.body["patientid"],
                "Full Name": req.body["patientname"],
                "NHS Test & Trace Key": req.body["patientkey"]
            }
        }
        console.log("issue credential with connection id " + connId + " params = ", params);

        await client.createCredential(params);
        console.log("----------------------> CREDENTIAL CREATED!");
        res.status(200).send();
    } else {
        res.status(500).send("Not connected");
    }
});

app.post('/api/vaccination/issue', cors(), async function (req, res) {

    console.log("IN /api/vaccination/issue: attributes = ", req.body);
    connId = req.body["key"];
    if (connId) {
        var params =
        {
            definitionId: process.env.CRED_DEF_ID_NHS_VACCINE_CERTIFICATE,
            connectionId: connId,
            credentialValues: {
                "Patient Reference": req.body["patientid"],
                "Patient Name": req.body["patientname"],
                "Certificate ID": req.body["vaxid"],
                "NHS Vaccine Centre": req.body["testcentre"],
                "Vaccination Date": req.body["vaxdate"],
                "Vaccination Type": req.body["vaxtype"]
            }
        }
        console.log("issue covid vaccination certificate credential with connection id " + connId + " params = ", params);

        await client.createCredential(params);
        console.log("----------------------> CREDENTIAL CREATED!");
        res.status(200).send();
    } else {
        res.status(500).send("Not connected");
    }
});

app.post('/api/testresult/issue', cors(), async function (req, res) {

    console.log("IN /api/testresult/issue: attributes = ", req.body);
    if (connId) {
        var params =
        {
            definitionId: process.env.CRED_DEF_ID_NHS_TEST_CERIFICATE,
            connectionId: connId,
            credentialValues: {
                "Patient Reference": req.body["patientId"],
                "Patient Name": req.body["patientName"],
                "Certificate ID": req.body["certificateId"],
                "Test Centre": req.body["testCentre"],
                "Test Type": req.body["testType"],
                "Test Date": req.body["testDate"],
                "Test Result": req.body["testResult"]
            }
        }
        console.log("issue covid certificate credential with connection id " + connId + " params = ", params);

        await client.createCredential(params);
        console.log("----------------------> CREDENTIAL CREATED!");
        res.status(200).send();
    } else {
        res.status(500).send("Not connected");
    }
});

app.post('/api/verifyvaccinationcertificate', cors(), async function (req, res) {
    template = "vaccine";
    verificationAccepted = false;

    const policyId = process.env.NHS_VACCINATION_CERTIFICATION_ID;
    console.log("KEY: Create VACCINE CERTIFICATE verification for policy ", policyId);

    const resp = await client.createVerificationFromPolicy(policyId);

    console.log("resp = ", resp);

    res.status(200).send({ login_request_url: resp.verificationRequestUrl });
});

app.post('/api/verifypositivetestcertificate', cors(), async function (req, res) {
    template = "positive";
    verificationAccepted = false;

    let revocationRequirement = {
        validAt: new Date() // Check if the credential is valid at the time of verification creation
    };



    const policyId = process.env.NHS_COVID_POSITIVE_TEST_CERTIFICATE_ID;
    console.log("KEY: Create POSITIVE TEST CERTIFICATE verification for policy ", policyId);

    // const resp = await client.createVerificationFromPolicy(policyId);
    const resp = await client.createVerificationFromPolicy(policyId, {
        revocationRequirement: revocationRequirement
    });
    console.log("resp = ", resp);

    res.status(200).send({ login_request_url: resp.verificationRequestUrl });
});


app.post('/api/verifynhskey', cors(), async function (req, res) {
    // console.log("req.body = ", req.body);
    // if (req.body === "vaccine") {
    //     template = "vaccine"
    // } else if (req.body === "positive") {
    //     template = "positive";
    // } else {
    //     template = "key";
    // }
    template = "key";
    verificationAccepted = false;

    const policyId = process.env.NHS_KEY_VERIFICATION_ID;
    console.log("KEY: Create verification for policy ", policyId);

    const resp = await client.createVerificationFromPolicy(policyId);

    console.log("resp = ", resp);

    res.status(200).send({ login_request_url: resp.verificationRequestUrl });
});

app.post('/api/verifynhspatient', cors(), async function (req, res) {
    template = "patient";
    verificationAccepted = false;

    const policyId = process.env.NHS_PATIENT_VERIFICATION_ID;
    console.log("PATIENT: Create verification for policy ", policyId);

    const resp = await client.createVerificationFromPolicy(policyId);

    console.log("resp = ", resp);

    res.status(200).send({ login_request_url: resp.verificationRequestUrl });
});

// app.get('/api/immuneverificationreceived', cors(), async function (req, res) {
//     console.log("Waiting for verification...");
//     await utils.until(_ => immuneVerificationAccepted === true);

//     res.status(200).send(immunedata);
// });

app.get('/api/verificationreceived', cors(), async function (req, res) {
    console.log("Waiting for verification...");
    await utils.until(_ => verificationAccepted === true);

    res.status(200).send(keydata);
});


async function findClientConnection(connectionId) {
    return await client.getConnection(connectionId);
}

async function getConnectionWithTimeout(connectionId) {
    let timeoutId;

    const delay = new Promise(function (resolve, reject) {
        timeoutId = setTimeout(function () {
            reject(new Error('timeout'));
        }, 3000);
    });

    // overall timeout
    return Promise.race([delay, findClientConnection(connectionId)])
        .then((res) => {
            clearTimeout(timeoutId);
            return res;
        });
}
app.post('/api/revokecertificate', cors(), async function (req, res) {
    console.log("revoking credential, id = ", credentialId);
    try {
        await client.revokeCredential(credentialId);
    }
    catch (e) {
        console.log(e.message || e.toString());
    }
    console.log("Credential revoked!");
    res.status(200).send();
});

app.post('/api/login', cors(), async function (req, res) {
    // send connectionless proof request for user registration details

    const policyId = process.env.LOGIN_VERIF_ID;
    let revocationRequirement = {
        validAt: new Date() // Check if the credential is valid at the time of verification creation
    };

    const resp = await client.createVerificationFromPolicy(policyId, {
        revocationRequirement: revocationRequirement
    });

    console.log("resp = ", resp);

    res.status(200).send({ login_request_url: resp.verificationRequestUrl });
});

app.get('/api/signout', cors(), async function (req, res) {
    console.log("Signing out...");
    loginConfirmed = false;
    res.status(200).send();
});

app.get('/api/loginconfirmed', cors(), async function (req, res) {
    console.log("Waiting for login confirmation...loginConfirmed = ", loginConfirmed);
    await utils.until(_ => loginConfirmed === true);
    console.log("--> DONE off we go")
    res.status(200).send(connectionAndCredentials);
});


app.post('/api/connect', cors(), async function (req, res) {
    console.log("Getting invite...")
    console.log("Invite params = ", req.body);

    registered = false;
    const invite = await getInvite();
    const attribs = JSON.stringify(req.body);
    console.log("invite= ", invite);
    cache.add(invite.connectionId, attribs);
    console.log("setting invite URL to ", invite.invitationUrl);
    res.status(200).send({ invite_url: invite.invitationUrl, key: invite.connectionId });
});

app.post('/api/sendmessages', cors(), async function (req, res) {
    let objects = req.body;
    const d = new Date();
    for (obj of objects) {
        var params =
        {
            definitionId: process.env.NHS_TEXT_ALERT_ID,
            connectionId: obj.id,
            credentialValues: {
                "Message Text": obj.message,
                "Message Date": d.toString()
            }
        }
        try {
            client.createCredential(params);
            console.log("SUCCESS! issued credential with connection id " + obj.id + " params = ", params);
        }
        catch (e) {
            console.log(e.message || e.toString());
            continue;
        }
    }
    res.status(200).send();
});

app.post('/api/acme/revoke', cors(), async function (req, res) {
    // 8db67fc2-90bd-45f2-89e2-09ef481bfdb1
    console.log("revoking acme credential, id = ", acmeCredentialId);
    await client.revokeCredential(acmeCredentialId);
    console.log("ACME Credential revoked!");

    const params =
    {
        basicMessageParameters: {
            "connectionId": connId,
            "text": "Acme credential has been revoked. You may want to delete this from your wallet."
        }
    };
    const resp = await client.sendMessage()

    console.log("------- Message sent to user's agent !");

    res.status(200).send();
});

app.get('/api/connected', cors(), async function (req, res) {
    console.log("Waiting for connection...");
    await utils.until(_ => registered === true);
    res.status(200).send(name);
});


app.post('/api/credential_accepted', cors(), async function (req, res) {
    console.log("Waiting for credential to be accepted...");
    await utils.until(_ => credentialAccepted === true);
    credentialAccepted = false;
    console.log("IT'S BEEN ACCEPTED!");
    res.status(200).send();
});


const getInvite = async () => {
    try {
        var result = await client.createConnection({});
        console.log(">>>>>>>>>>>> INVITE = ", result);
        return result;
    } catch (e) {
        console.log(e.message || e.toString());
    }
}




/**
 * Listen on provided port, on all network interfaces.
 */

const port = normalizePort('3002');
app.set('port', port);

const server = http.createServer(app);

// initialize the json server

const jsonServer = require('json-server');

// You may want to mount JSON Server on a specific end-point, for example /api
// Optiona,l except if you want to have JSON Server defaults
// server.use('/api', jsonServer.defaults()); 
// app.use(jsonServer.bodyParser);
app.use(jsonServer.router('db.json'));


server.listen(port, async function () {
    const url_val = await ngrok.connect(port);
    console.log("============= \n\n" + url_val + "\n\n =========");
    let response = await client.createWebhook({
        url: url_val + "/webhook",  // process.env.NGROK_URL
        type: "Notification"
    });
    cache.add("webhookId", response.id);
    console.log('Listening on port %d', server.address().port);
});
server.on('error', onError);
server.on('listening', onListening);




/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
