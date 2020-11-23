import React, { Component } from 'react';
import './button.css';
import patientItems from './components/Fields/patient';
import visitItems from './components/Fields/visit';
import resultItems from './components/Fields/result';
import matcherItems from './components/Fields/matcher';
import vaccineItems from './components/Fields/vaccine';
import immunityItems from './components/Fields/immunity'
import RestaurantRegistrationDialog from './components/RestaurantRegistrationDialog';
import NHSRegistrationDialog from './components/NHSRegistrationDialog';
import NavBar from './components/NavBar';
import Form from './components/Form';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './components/TabPanel';
import WelcomeDialog from './components/Welcome';

import GlobalCss from './components/Global';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import axios from 'axios';
import _ from 'lodash';
import QRcode from 'qrcode.react';
import traceRoutes from './routes/traceRoutes';
import signInRoutes from './routes/signInRoutes';
import LoginDialog from './components/LoginDialog';
import utilities from './utils';
import utils from './utils';

axios.defaults.baseURL = 'http://localhost:3002/';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const NHS_KEY = 'b490fb9b-d605-4568-88b8-42920c89b8f5';
const NHS_NAME = 'Alice Richardson';
const VACCINE_ID = "SARS-CoV-2-" + Math.floor(1000000 + Math.random() * 9000000).toString();

const JSON_SERVER_URL = 'http://localhost:3004';

const muiTheme = createMuiTheme({
    typography: {
        "fontFamily": `"Lato","Arial","Helvetica","FreeSans","sans-serif"`,
        "fontSize": 14,
        "fontWeightLight": 300,
        "fontWeightRegular": 400,
        "fontWeightMedium": 500
    }
});

const initState = {
    visit: {
        nhsappkey: "",
        restaurantname: "",
        restaurantid: -1,
        visitdate: "",
        visittimein: "",
        visittimeout: "",
        key_received: false,
    },
    patient: {
        // patientid: "123456", // temporary for testing
        // patientname: "Alice Richardson", // temporary for testing
        patientid: "", // temporary for testing
        patientname: "", // temporary for testing
        testandtracekey: "",
        credential_accepted: true
    },
    result: {
        patientid: "",
        patientname: "",
        certificateId: "",
        testcentre: "",
        testtype: "",
        testdate: "",
        testresult: "",
        ready_to_issue_certificate: false,
        requesting_patient_data: false,
        requesting_patient_key: false,
        certificate_issued: false,
        revoked: false,
        awaiting_revoke: false,
        credential_accepted: true
    },
    matcher: {
        nhsappkey: NHS_KEY, // for testing
        // nhsappkey: "",
        patientname: "",
        ready_to_send_message: false,
        messages_sent: false,
        displayRows: [], // contains the duplicates for demo purposes
        rows: [
            // {
            //     nhsappkey: '281c4bae-bf10-4496-a7d0-706ddf5a15b5',
            //     restaurantname: "Red Lion Pub",
            //     visitdate: "2020-11-13",
            //     visittimein: "21:00:04",
            //     visittimeout: "22:34:00"
            // }
        ],
    },
    vaccine: {
        patientid: '',
        patientname: '',
        vaxid: '',
        testcentre: '',
        vaxdate: '',
        vaxtype: '',
        key: '',
        ready_to_issue_vaccine: false,
        vaccine_certificate_accepted: true,
        revoked: false
    },

    immunity: {
        restaurantname: '',
        patientname: '',
        immunitytype: '',
        certificatetype: '', // eg SARS-COVID-2, or type of vaccine
        immunitydate: '',
        testcentre: '',
        immunityreference: '',
        immunity_certificate_accepted: true,
        revoked: false,
        done: false,
    },

    display_ad: true,
    collapse_open: false,
    qr_open: false,
    welcome_open: true,
    qr_hasClosed: false,
    qr_placeholder: "",
    invite_url: "",
    login_url: "",
    registering_restaurant: false,
    registering_nhs_admin: false,
    registering_nhs_patient: false,
    loggingIn: false,
    restaurant: {
        ready_to_issue_visit: false,
        credential_accepted: true,
        verification_received: true,
        has_been_revoked: true,
        loading: false,
        nhs_key_received: true,
        claim_button_disabled: true
    },

    register_restaurant: false,
    register_nhs: false,
    register_restaurant_form_open: false,
    register_nhs_form_open: false,
    login: false,
    login_type: '',
    login_form_open: false,
    restaurantname: '',
    restauranttelnumber: '',
    restaurantlocation: '',
    restaurantemail: '',
    restaurantpassword: '',

    nhsfirstname: '',
    nhslastname: '',
    nhslocation: '',
    nhsemail: '',
    nhspassword: '',

    firstname: '',
    lastname: '',
    nhsid: '',
    connection_name: sessionStorage.getItem("name"),
    country: '',
    login_loading: false,
    userData: {},
    value: 0
};
export class App extends Component {

    constructor(props) {
        super(props);
        this.state = initState;
        sessionStorage.setItem("name", "");
    }

    setCollapseClosed() {
        this.setState({
            collapse_open: false
        });
    }

    getPatientData = async () => {
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, verification_received: false }
        }));
        let resp = await this.onRequestNHSPatientData("patient");

        let certificate_issued = resp.data.testData != undefined;
        let result = "";
        if (certificate_issued) {
            result = resp.data.testData["Test Result"].toUpperCase();
        }

        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, verification_received: true },
            vaccine: { ...prevState.vaccine, ready_to_issue_vaccine: true },
            result: { ...prevState.result, certificate_issued: certificate_issued, testresult: result }
        }));

    }
    onRevokeTestCertificate = async () => {
        await traceRoutes.revokeTestCertificate();

        this.setState(prevState => ({
            result: { ...prevState.result, awaiting_revoke: true, revoked: true }
        }));
    }

    onIssueTestCertificate = async () => {

        const resultDetails = {
            patientId: this.state.result.patientid,
            patientName: this.state.result.patientname,
            certificateId: this.state.result.certificateid,
            testCentre: this.state.result.testcentre,
            testType: this.state.result.testtype,
            testDate: this.state.result.testdate,
            testResult: this.state.result.testresult
        }

        this.setState(prevState => ({
            result: { ...prevState.result, credential_accepted: false }
        }));

        await traceRoutes.issueTestCertificate(resultDetails);

        this.setState(prevState => ({
            result: { ...prevState.result, certificate_issued: true }
        }));

        // persist test result to database
    }

    onIssuePatient = async () => {
        this.setState(prevState => ({
            patient: { ...prevState.patient, credential_accepted: false },
            registering_nhs_patient: true
        }));

        await this.connect();

        const patientDetails = {
            patientid: this.state.patient.patientid,
            patientname: this.state.patient.patientname,
            patientkey: this.state.patient.testandtracekey
        }

        this.setState(prevState => ({
            patient: { ...prevState.patient, credential_accepted: false }
        }));

        await traceRoutes.issueNHSPatient(patientDetails);

        this.setState(prevState => ({
            registering_nhs_patient: false, qr_open: false,
            patient: { ...prevState.patient, credential_accepted: true, patientid: '', patientname: '', testandtracekey: '' }
        }));
    }

    setFields(nhskey) {
        const name = sessionStorage.getItem("name");
        const id = sessionStorage.getItem("id");
        var d = new Date();
        let visittimeout = this.state.visit.visittimeout;
        let visitdate = this.state.visit.visitdate;
        if (this.state.visit.visitdate === "") {
            visitdate = utilities.formatDate(d, 0);
        }
        let visittime = this.state.visit.visittimein;
        if (this.state.visit.visittimein === "") {
            visittime = utilities.formatTime(d);
        }
        // const visitdate = "2020-11-13"; // for testing
        // const visittime = utilities.formatTime(d);
        // const visittime = "1:05:16"; // for testing
       
        if (visittime.length === 5) {
            visittime = visittime + ":00";
        }
        if (visittimeout.length === 5) {
            visittimeout = visittimeout + ":00";
        }
        // if (this.state.visit.visittimeout.length === 5) {
        //     const t = this.state.visit.visittimeout + ":00";
        //     { ...prevState.visit, visittimeout: t }
        //     }));
        // }
       
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, nhs_key_received: true, ready_to_issue_visit: true },
            visit: {
                ...prevState.visit,
                nhsappkey: nhskey,
                restaurantname: name,
                restaurantid: id,
                visitdate: visitdate,
                visittimein: visittime,
                visittimeout: visittimeout
            },
            matcher: {
                ...prevState.matcher,
                nhsappkey: nhskey,
            }
        }));
       
    }

    // test function when we don't want to do the proof request for the key
    onVisitData = async () => {
        if (this.state.restaurant.ready_to_issue_visit) {
            const json = JSON.stringify(this.state.visit);
            await this.saveVisitData();
        } else {
            const nhskey = NHS_KEY;
            this.setFields(nhskey);
        }
    }

    dateInRange = (from, to, check) => {
        const aRes = check.getTime() > from.getTime();
        const bRes = check.getTime() < to.getTime();
        if (aRes && bRes) {
            return true;
        }
        return false;
    }

    sendMessagesToContacts = async () => {
        const messages = this.state.matcher.rows.map(a => ({ id: a.nhsappkey, message: a.message }));

        const resp = await traceRoutes.sendMessages(messages);

        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, loading: false },
            matcher: { ...prevState.matcher, messages_sent: true }
        }));
    }

    onVaccinationTEST = async () => {
        if (!this.state.vaccine.ready_to_issue_vaccine) {
            const name = sessionStorage.getItem("name");
            const d = new Date();
            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, loading: false },
                vaccine: {
                    ...prevState.vaccine, 
                    patientid: '123456',
                    patientname: NHS_NAME,
                    vaxid: VACCINE_ID,
                    testcentre: name,
                    vaxdate: utils.formatDate(d),
                    key: NHS_KEY,
                    ready_to_issue_vaccine: true
                }
            }));
            this.setState(prevState => ({
                vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: false }
            }));
            return;
        }

        const resp = await traceRoutes.issueVaccineCertificate(this.state.vaccine);
        this.setState(prevState => ({
            vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: true }
        }));
        this.clearVaccineForm();
    }
    onVaccination = async () => {

        if (!this.state.vaccine.ready_to_issue_vaccine) {
            this.setState(prevState => ({
                vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: false }
            }));
            await this.getPatientData();
            this.setState(prevState => ({
                vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: true }
            }));
            return;
        }
        this.setState(prevState => ({
            vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: false }
        }));
        const resp = await traceRoutes.issueVaccineCertificate(this.state.vaccine);
        console.log("QUACK ACCEPTED!");
        this.setState(prevState => ({
            vaccine: { ...prevState.vaccine, vaccine_certificate_accepted: true }
        }));
        this.clearVaccineForm();
    }

    onImmunity = async () => {
        if (this.state.immunity.done) {
            this.clearImmunityForm();
            return;
        }
        // positive is +ve test certificate or antibdy
        const certificate = this.state.immunity.immunitytype === "VACCINE CERTIFICATE" ? "vaccine" : "positive";
        this.setState(prevState => ({
            immunity: { ...prevState.immunity, immunity_certificate_accepted: false }
        }));

        let resp = await traceRoutes.requestVaccinationCertificate(certificate);
        this.setState({
            invite_url: resp.data.login_request_url
        });

        this.setQRFormOpen(true);

        resp = await traceRoutes.waitForVerificationReceived();

        this.setQRFormOpen(false);


        console.log("BARK resp = ", resp);
        this.setState(prevState => ({
            immunity: {
                ...prevState.immunity, immunity_certificate_accepted: true,
                patientname: resp.data.name,
                certificatetype: resp.data.type,
                immunitydate: resp.data.date,
                testcentre: resp.data.centre,
                immunityreference: resp.data.certificateId,
                revoked: !resp.data.isValid,
                done: true
            }
        }));
    }

    getMessage = (visitdate) => {
        return `A person has tested positive for COVID-19 who was at a venue where you were present on ${visitdate}. You should self-isolate for a further ${this.getSelfIsolationDays(visitdate)} days. Only consider a test if you develop symptoms.`
    }

    getSelfIsolationDays = (visitdate) => {
        // calc the self-isolation days => 14 - (days between visit date and today)
        const diffInMs = new Date - new Date(visitdate)
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
        return Math.round(14 - diffInDays);
    }

    onSearch = async () => {
        if (this.state.matcher.messages_sent) {
            this.clearSearchForm();
            return;
        }
        if (this.state.matcher.ready_to_send_message) {
            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, loading: true },
            }));
            return await this.sendMessagesToContacts();
        }

        if (this.state.matcher === "") {
            this.setState(prevState => ({
                matcher: { ...prevState.matcher, nhsappkey: this.state.patient.testandtracekey, patientname: this.state.patient.patientname }
            }));
        }


        // 1. search for visits
        const resp = await traceRoutes.searchForVisitsUsingKey(JSON_SERVER_URL, this.state.matcher.nhsappkey);

        // resp will be a list of visits (all places this keyholder has visited) => resp.data
        // 2. for each visit in the list
        let visit;
        let aggregateVisits = [];
        for (visit of resp.data) {
            console.log("visit = ", visit);
            // 3. pull out restaurant id, date and times of visit -> this is the target visit
            let venueId = visit.restaurantid
            let visitDate = visit.visitdate;
            if (visit.visittimein.length === 5) {
                visit.visittimein = visit.visittimein + ":00";
            }
            if (visit.visittimeout.length === 5) {
                visit.visittimeout = visit.visittimeout + ":00";
            }
            let thisInDate = new Date(visit.visitdate + " " + visit.visittimein);
            let thisOutDate = new Date(visit.visitdate + " " + visit.visittimeout);

            // 4. search for all keyholders who visited that venue (as given by VenueId) on that date/time
            //  => first get all keyholders who visited that venue on that date

            const visitResp = await traceRoutes.searchForVisitsUsingIdAndDate(JSON_SERVER_URL, venueId, visitDate);

            //  => then filter out any visits that fall outside the timeIn -> timeOut duration of visit
            let parent = this;
            let filteredVisits = visitResp.data.filter(function (item) {
                const format = item.visitdate + " " + item.visittimeout;
                let inDate = new Date(item.visitdate + " " + item.visittimein);
                let outDate = new Date(item.visitdate + " " + item.visittimeout);

                // if either of these dates falls between the in and out dates of the target visit -> add to filtered list
                return parent.dateInRange(thisInDate, thisOutDate, inDate)
                    || parent.dateInRange(thisInDate, thisOutDate, outDate);
            });

            filteredVisits = filteredVisits.map(obj => ({ ...obj, message: this.getMessage(obj.visitdate) }))

            aggregateVisits = aggregateVisits.concat(filteredVisits);
        }

       
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, loading: true }
        }));

        // filter out duplicates (should get the most recent contact where there are multiple)
        let filteredAggregateVisits = _.uniqBy(aggregateVisits.reverse(), function (e) {
            return e.nhsappkey;
        });

        filteredAggregateVisits = filteredAggregateVisits.reverse();

        // filter out the current user (we don't want to send a message to the patient who tested positive to self-isolate!)
        const thiskey = this.state.matcher.nhsappkey;
        filteredAggregateVisits = filteredAggregateVisits.filter(function (item) {
            return item.nhsappkey != thiskey;
        });

        // 6. Display the list of keyholders and visit data on screen
        // the state change loads the results from the queries into the rows object for the table component to display

        setTimeout(() => {
            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, loading: false },
                matcher: {
                    ...prevState.matcher,
                    ready_to_send_message: true,
                    rows: filteredAggregateVisits,
                    displayRows: aggregateVisits.reverse()
                }
            }));
        }, 2000);
    }
    clearSearchForm = () => {
        this.setState({
            matcher: initState.matcher
        });
    }
    clearVaccineForm = () => {
        this.setState(prevState => ({
            vaccine: initState.vaccine,
            restaurant: { ...prevState.restaurant, nhs_key_received: true, ready_to_issue_visit: false } 
        }));
    }

    clearImmunityForm = () => {
        this.setState({
            immunity: initState.immunity
        });
    }

    clearVisitForm = () => {
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, nhs_key_received: true, ready_to_issue_visit: false },
            visit: initState.visit
        }));
    }

    saveVisitData = async () => {
       
        this.startLoader();
        setTimeout(() => {
            this.stopLoader();
            this.clearVisitForm();
        }, 2000);

        console.log("QUACK visit = ", this.state.visit);
        const json = JSON.stringify(this.state.visit);
        
        await traceRoutes.saveVisitData(JSON_SERVER_URL, json);
    }

    onRequestNHSPatientData = async (type) => {
        if (this.state.restaurant.ready_to_issue_visit) {
            this.saveVisitData();
        } else {
            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, nhs_key_received: false },
            }));
            let resp;
            console.log("type = ", type);
            try {
                if (type === "key") {
                    resp = await traceRoutes.verifyNHSKey();
                    this.setState(prevState => ({
                        result: { ...prevState.result, requesting_patient_key: true },
                        invite_url: resp.data.login_request_url
                    }));
                }
                else {
                    resp = await traceRoutes.verifyNHSPatient();
                    this.setState(prevState => ({
                        result: { ...prevState.result, requesting_patient_data: true },
                        invite_url: resp.data.login_request_url
                    }));
                }
            }
            catch (e) {
                console.log(e);
                return;
            }
            this.setQRFormOpen(true);

            resp = await traceRoutes.waitForVerificationReceived();

            this.setQRFormOpen(false);

            const name = sessionStorage.getItem("name");
            const d = new Date();


            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, nhs_key_received: true, ready_to_issue_visit: true, credential_accepted: true },
                result: { ...prevState.result, patientid: resp.data.id, patientname: resp.data.name, ready_to_issue_certificate: true, requesting_patient_data: false, requesting_patient_key: false },
                patient: { ...prevState.patient, patientid: resp.data.id, patientname: resp.data.name, testandtracekey: resp.data.nhskey },
                vaccine: {
                    ...prevState.vaccine, patientid: resp.data.id, patientname: resp.data.name, testcentre: name, vaxdate: utils.formatDate(d), vaxid: VACCINE_ID, key: resp.data.nhskey
                },
                immunity: {
                    ...prevState.immunity, key: resp.data.nhskey
                },
                visit: { ...prevState.visit, key_received: true },
                matcher: {
                    ...prevState.matcher,
                    patientname: resp.data.name,
                }
            }));



            this.setFields(resp.data.nhskey);
            return resp;
        }
    }

    setPatientFieldValue = (event) => {
        const { target: { name, value } } = event;

        this.setState(prevState => ({
            patient: {
                ...prevState.patient, [name]: value
            }
        }));
    }

    setResultFieldValue = (event) => {
        const { target: { name, value } } = event;
        this.setState(prevState => ({
            result: {
                ...prevState.result, [name]: value
            }
        }));
    }

    setVaccineFieldValue = (event) => {
        const { target: { name, value } } = event;
        this.setState(prevState => ({
            vaccine: {
                ...prevState.vaccine, [name]: value
            }
        }));
    }

    setImmunityFieldValue = (event) => {
        const { target: { name, value } } = event;
        this.setState(prevState => ({
            immunity: {
                ...prevState.immunity, [name]: value
            }
        }));
    }

    setVisitFieldValue = (event) => {
        const { target: { name, value } } = event;
        this.setState(prevState => ({
            visit: {
                ...prevState.visit, [name]: value
            }
        }));
    }

    loadrestaurantCredentials = (credentials) => {
        const restaurantValues = credentials.filter(function (credential) {
            return credential.values.Platform === "restaurant";
        });

        let restaurantFields;
        let creationDate;
        if (restaurantValues.length > 0) {
            restaurantFields = restaurantValues[restaurantValues.length - 1].values;
            creationDate = restaurantValues[restaurantValues.length - 1].issuedAtUtc;
            var d = new Date(creationDate);
            // d.setMonth(d.getMonth() + 1);
            this.setState(prevState => ({
                restaurant: {
                    ...prevState.restaurant, qr_feedbackCollected: true,
                    credential_accepted: true, has_been_revoked: false,
                    loading: false
                },
                user: {
                    UserID: restaurantFields["User Name"],
                    FeedbackScore: restaurantFields["Feedback Score"],
                    RegistrationDate: restaurantFields["Registration Date"],
                    UniqueNegativeFeedbackCount: restaurantFields["Negative Feedback Count"],
                    UniquePositiveFeedbackCount: restaurantFields["Positive Feedback Count"],
                    PositiveFeedbackPercent: restaurantFields["Positive Feedback Percent"],
                    CreationDate: utilities.formatDate(d)
                }
            }));
            sessionStorage.setItem("waitingForrestaurantUserData", "false");
            // sessionStorage.setItem("restaurantUserData", JSON.stringify(this.state.user));
            // sessionStorage.setItem("restaurantStateData", JSON.stringify(this.state.restaurant));
            sessionStorage.setItem("state", JSON.stringify(this.state));

        }
    }

    logout = async () => {
        // reset all forms, reset component state, 
        console.log("Logging out...");
        await signInRoutes.signout();
        console.log("Setting state back to init state")
        this.setState(initState);
        sessionStorage.setItem("state", null);
        sessionStorage.setItem("name", "");
    }

    connect = async () => {
        console.log("QUACK IN CONNECT..!");
        let resp;
        try {
            resp = await signInRoutes.connect();
        }
        catch (e) {
            console.log(e);
        }
        console.log("QUACK RETURNED!");
        this.setState(prevState => ({
            invite_url: resp.data.invite_url,
            patient: { ...prevState.patient, testandtracekey: resp.data.key }
        }));

        this.setQRFormOpen(true);

        await signInRoutes.waitForConnection();

        this.setQRFormOpen(false);
    }

    postLogin = async () => {
        this.setState({
            login_form_open: true, loggingIn: true, welcome_open: false
        });
        // let resp;
        // try {
        //     resp = await signInRoutes.login();
        // }
        // catch (e) {
        //     console.log(e);
        // }

        // console.log("LOGIN ok! resp = ", resp);

        // this.setState({
        //     login_loading: false,
        // });

        // this.setState({ invite_url: resp.data.login_request_url });

        // this.setQRFormOpen(true);

        // console.log("WAITING FOR LOGIN DATA...")

        // const login = await signInRoutes.waitForLoginConfirmed();

        // this.setQRFormOpen(false);

        // if (login && login.status === 200) {
        //     console.log("Connection  = ", login.data);
        //     const name = login.data.connectionContract.name;

        //     this.setState({
        //         login: true, connection_name: name, loggingIn: false
        //     });
        //     sessionStorage.setItem("name", name);
        //     sessionStorage.setItem("login", true);

        //     // push the credentials back in to the forms for the correct platforms
        //     this.loadrestaurantCredentials(login.data.credentials);
        // } else {
        //     console.log("no connection found");
        //     this.setState({
        //         collapse_open: true
        //     });
        // }
    }

    setLoginDetails = (type) => {
        if (type === "restaurant") {
            this.setState({
                login: true, register_restaurant: true, loggingIn: false, login_type: type, welcome_open: false
            });
        } else {
            this.setState({
                login: true, register_nhs: true, loggingIn: false, login_type: type, welcome_open: false
            });
        }
    }

    postRestaurantRegister = async (form) => {
        // write restaurant registration data to json server

        // display a spinner for three seconds to mock the database write operation taking a while
        this.startLoader();

        setTimeout(() => {
            console.log("DONE!");

            // this.setState(prevState => ({
            //     restaurant: { ...prevState.restaurant, loading: false, name: form.restaurantname }
            // }));

            sessionStorage.setItem("name", form.restaurantname);
            this.setState(prevState => ({
                immunity: {
                    ...prevState.immunity, restaurantname: form.restaurantname
                },
            }));
            this.setLoginDetails("restaurant");
            this.registerRestaurantFormOpen(false);
            this.stopLoader();
        }, 2000);
        const json = JSON.stringify(form);
        await traceRoutes.registerRestaurant(JSON_SERVER_URL, json);
    }

    postNHSRegister = async (form) => {
        // display a spinner for 2 seconds to mock the database write operation taking a while
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, loading: true }
        }));

        setTimeout(() => {
            console.log("DONE!");

            // write NHS admin registration data to json server

            sessionStorage.setItem("name", form.nhslocation);

            this.setLoginDetails("nhs");
            this.registerNHSFormOpen(false);
            this.setState(prevState => ({
                restaurant: { ...prevState.restaurant, loading: false, name: form.restaurantname }
            }));
        }, 2000);
        const json = JSON.stringify(form);
        await traceRoutes.registerNHSAdmin(JSON_SERVER_URL, json);
    }


    loginFormOpen = (open) => {
        this.setState({
            login_form_open: open,
            welcome_open: !open
        });
    }

    checkLoginInfo = async (form) => {
        // note that in a production system we would have a single login table with keys pointing to 
        // restaurant or NHS users.

        // first check restaurants
        const res = await traceRoutes.getRestaurant(JSON_SERVER_URL, form.email, form.password);

        // if not found check NHS users
        if (res.data.length === 1) {
            sessionStorage.setItem("name", res.data[0].restaurantname);
            sessionStorage.setItem("id", res.data[0].id);
            this.setLoginDetails("restaurant");

            this.setState(prevState => ({
                visit: {
                    ...prevState.visit, restaurantname: res.data[0].restaurantname, restaurantid: res.data[0].id
                },
                immunity: {
                    ...prevState.immunity, restaurantname: res.data[0].restaurantname
                },
                login_form_open: false,
                login: true,
            }));
            return;
        } else {
            // assume there can never be more than one user with same key
            console.log("NO RESTAURANT -> LOOK FOR NHS ADMIN INSTEAD")
            const res = await traceRoutes.getNHSAdmin(JSON_SERVER_URL, form.email, form.password);
            if (res.data.length === 1) {
                sessionStorage.setItem("name", res.data[0].nhslocation);
                this.setLoginDetails("nhs");
                this.setState({
                    login_form_open: false,
                    login: true,
                });
                return;
            }
            console.log("ERROR NOT FOUND!");
            this.setState({
                collapse_open: true
            });
        }
        // if not found display error message


    }

    registerRestaurantFormOpen = (open) => {
        this.setState({
            register_restaurant_form_open: open,
            registering_restaurant: true
        });
    }
    registerNHSFormOpen = (open) => {
        this.setState({
            register_nhs_form_open: open,
            registering_nhs_admin: true
        });
    }



    restaurantGetUserData = async () => {
        console.log("Waiting for the feedback to arrive...");
        const user = await traceRoutes.getFeedback();

        console.log("User Data = ", user.data);

        var d = new Date();
        d.setMonth(d.getMonth() + 1);
        this.setState(prevState => ({
            restaurant: {
                ...prevState.restaurant, qr_feedbackCollected: true,
                loading: false
            },
            user: {
                UserID: user.data.UserID,
                FeedbackScore: user.data.FeedbackScore,
                RegistrationDate: user.data.RegistrationDate.substring(0, 10),
                UniqueNegativeFeedbackCount: user.data.UniqueNegativeFeedbackCount,
                UniquePositiveFeedbackCount: user.data.UniquePositiveFeedbackCount,
                PositiveFeedbackPercent: user.data.PositiveFeedbackPercent,
                CreationDate: utilities.formatDate(d)
            }
        }));

        window.stop();
        sessionStorage.setItem("waitingForrestaurantUserData", "false");
        // sessionStorage.setItem("restaurantUserData", JSON.stringify(this.state.user));
        // sessionStorage.setItem("restaurantStateData", JSON.stringify(this.state.restaurant));
        sessionStorage.setItem("state", JSON.stringify(this.state));

        this.setState({ value: 0 });
    }

    getRevokeCertificateLabel() {
        if (this.state.result.revoked) {
            return "Clear Form";
        }
        return (!this.state.result.awaiting_revoke ? "Revoke Test Certificate" : "Awaiting Confirmation...");
    }

    getVisitLabel() {
        if (this.state.restaurant.ready_to_issue_visit) {
            return "Save Visit Data";
        }
        return (this.state.restaurant.nhs_key_received ? "Check In Customer" : "Awaiting Verification...");
    }

    getVaccineLabel() {
        if (this.state.vaccine.ready_to_issue_vaccine) {
            return this.state.vaccine.vaccine_certificate_accepted ? "Issue Vaccine Credential" : "Awaiting Verification";
        }
        return this.state.restaurant.verification_received ? "Request Patient Data" : "Awaiting Verification...";
    }

    getImmunityLabel() {
        if (this.state.immunity.done) {
            return "Clear Form";
        }
        return (this.state.immunity.immunity_certificate_accepted ? "Request Immunity Certificate" : "Awaiting Verification...");
    }

    getSearchLabel() {
        if (this.state.matcher.messages_sent) {
            return "Clear Form";
        }
        return (!this.state.matcher.ready_to_send_message ? "Search Patients" : "Send Notification To Matched Patients");
    }

    getNHSKeyLabel() {
        return (this.state.patient.credential_accepted ? "Issue Patient Data" : "Awaiting Acceptance...");
    }

    getPatientDataLabel() {
        return this.state.restaurant.verification_received ? "Request Patient Data" : "Awaiting Verification...";
    }

    getTestLabel() {
        if (this.state.result.revoked) {
            return "Clear Form";
        }
        return (this.state.result.credential_accepted ? "Issue Test Certificate" : "Awaiting Acceptance...");
    }

    getDisabled(platform) {
        return (!this.state[platform].credential_accepted || !(this.state.restaurant.nhs_key_received));
    }

    getNHSPatientDisabled() {
        return (this.state.patient.credential_accepted === false || this.state.patient.patientid === '' || this.state.patient.patientname === '');
    }

    getVaccineDisabled() {
        return !this.state.vaccine.vaccine_certificate_accepted || (this.state.vaccine.ready_to_issue_vaccine && this.state.vaccine.vaxtype === '');
    }

    getImmunityDisabled() {
        return !this.state.immunity.immunity_certificate_accepted || this.state.immunity.immunitytype === '';
    }

    getResultDisabled() {
        return this.state.result.testresult === '';
    }
    getVisitDisabled() {
        return this.state.key_received && this.state.visit.visittimeout === '';
    }

    // getClaimDisabled(platform) {
    //     return (!this.state[platform].credential_accepted || !(this.state.restaurant.nhs_key_received) || (this.state.restaurant.claim_button_disabled));
    // }

    patientButton() {
        return (
            <div style={{ marginTop: '50px', }}>
                <Button className="registerbutton" disabled={this.getNHSPatientDisabled()}
                    onClick={() => this.onIssuePatient()} >
                    {this.getNHSKeyLabel()}
                </Button>
            </div>
        )
    }

    resultButton() {
        if (!this.state.result.ready_to_issue_certificate) {
            return (
                <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                    <Button className="registerbutton" disabled={false}
                        onClick={() => this.getPatientData()} >
                        {this.getPatientDataLabel()}
                    </Button>
                </div>
            )
        } else if (!this.state.result.certificate_issued || this.state.result.revoked) {
            return (
                <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                    <Button className="registerbutton" disabled={this.getResultDisabled()}
                        onClick={() => this.onIssueTestCertificate()} >
                        {this.getTestLabel()}
                    </Button>
                </div>
            )
        } else {
            return (
                <div style={{ marginTop: '15px', marginBottom: '20px' }}>
                    <Button className="revokebutton" disabled={false}
                        onClick={() => this.onRevokeTestCertificate()} >
                        {this.getRevokeCertificateLabel()}
                    </Button>
                </div>
            )
        }
    }

    visitButton() {
        return (
            <div style={{ marginTop: '50px', }}>
                <Button className="registerbutton" disabled={this.getVisitDisabled()}
                    onClick={() =>
                        this.onRequestNHSPatientData("key")
                        // this.onVisitData() // test method with hard wired key
                    }
                >
                    {this.getVisitLabel()}
                </Button>
            </div>
        )
    }

    matcherButton() {
        return (
            <div style={{ marginTop: '10px', marginBottom: '-10px' }}>
                <Button className="registerbutton" disabled={false}
                    onClick={() =>
                        this.onSearch()
                    }
                >
                    {this.getSearchLabel()}
                </Button>
            </div>
        )
    }

    vaccineButton() {
        return (
            <div style={{ marginTop: '10px', marginBottom: '-10px' }}>
                <Button className="registerbutton" disabled={this.getVaccineDisabled()}
                    onClick={() =>
                        // this.onVaccinationTEST()
                        this.onVaccination()
                    }
                >
                    {this.getVaccineLabel()}
                </Button>
            </div>
        )
    }

    immunityButton() {
        return (
            <div style={{ marginTop: '10px', marginBottom: '-10px' }}>
                <Button className="registerbutton" disabled={this.getImmunityDisabled()}
                    onClick={() =>
                        this.onImmunity()
                    }
                >
                    {this.getImmunityLabel()}
                </Button>
            </div>
        )
    }

    getQRCodeLabel() {
        if (this.state.registering_restaurant) {
            return "Scan this QR code to Register a Restaurant with EuroLedger Test & Trace";
        } else if (this.state.registering_nhs_admin) {
            return "Scan this QR Code to register as an NHS Administrator with EuroLedger Test & Trace"
        } else if (this.state.registering_nhs_patient) {
            return "Scan this QR code to Register an NHS Patient as a Test & Trace User";
        } else if (this.state.result.requesting_patient_data) {
            return "Scan this QR code to request verification of NHS Patient Data";
        } else if (this.state.result.requesting_patient_key) {
            return "Scan this QR code to request NHS Test & Trace key";
        }
        else {
            return "Scan this QR code to Login to EuroLedger Test & Trace"
        }
    }

    handleLoginClose() {
        this.setState({
            login_form_open: false
        });
    }

    startLoader() {
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, loading: true }
        }));
    }


    stopLoader() {
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, loading: false }
        }));
    }

    setQRFormOpen(open) {
        this.setState({
            qr_open: open
        });
    }

    reloadLoginDetails() {
        this.setState({ restaurantname: sessionStorage.getItem("name") })
        const l = sessionStorage.getItem("login") === "true" ? true : false;
        if (l) {
            console.log(">>>>>>>>>>>>>>>>>>>>>> componentDidMount: set login to ", l);
            this.setState({ login: true })
        }
    }

    reloadrestaurantUserDetails() {
        const state = JSON.parse(sessionStorage.getItem("state"));
        console.log("state = ", state);
        if (state) {
            this.setState(prevState => ({
                state: { ...prevState, state }
            }));
        }
    }

    getLoginLabel() {
        return this.state.login ? "Sign Out" : "Login"
    }

    getRegisterRestaurantLabel() {
        return this.state.register_restaurant || this.state.register_nhs ? "" : "Register Venue";
    }

    getRegisterNHSLabel() {
        return this.state.register_restaurant || this.state.register_nhs ? "" : "Register NHS Admin";
    }

    componentDidMount() {
        // this.reloadLoginDetails();
        // this.reloadrestaurantUserDetails();
        // if (sessionStorage.getItem("selectedTab")) {
        //     console.log("Setting selected tab to ", sessionStorage.getItem("selectedTab"))
        //     this.setState({ value: parseInt(sessionStorage.getItem("selectedTab")) })
        // } else {
        //     console.log("No selected tab");
        // }
        // const invoiceDate = this.formatDate(new Date(), 0);
        // this.setState(prevState => ({
        //     invoice: { ...prevState.invoice, invoiceDate: invoiceDate }
        // }));
    }

    handleChange = (event, newValue) => {
        this.setState({ value: newValue });
        const name = sessionStorage.getItem("name");

        const certificateId = Math.floor(1000000 + Math.random() * 9000000).toString();
        var d = new Date();
        const testdate = utilities.formatDate(d, 0);

        this.setState(prevState => ({
            result: {
                ...prevState.result,
                patientid: this.state.patient.patientid,
                patientname: this.state.patient.patientname,
                certificateid: certificateId,
                testcentre: name,

                testtype: "COVID-19 PCR",
                testdate: testdate
            }
        }));
    };
    setCollapseClosed = () => {
        this.setState({
            collapse_open: false
        });
    }




    render() {

        let web = sessionStorage.getItem("waitingForrestaurantUserData");
        if (web === "true") {
            this.restaurantGetUserData();
        }
        const a11yProps = (index) => {
            return {
                id: `simple-tab-${index}`,
                'aria-controls': `simple-tabpanel-${index}`,
            };
        }


        const getTabDisplay = () => {
            return !this.state.welcome_open && this.state.login ? 'block' : 'none';
        }

        // const getTabDisplay = () => {
        //     return this.state.welcome_open ? 'block' : 'none';
        // }

        const getImage = () => {

            if (this.state.login) {
                if (this.state.login_type === "nhs") {
         
                    return `url(${"covid2.jpg"})`;
                } else {

                    let name = sessionStorage.getItem("name");
                    if (name.indexOf("Library") != -1) {
                        return `url(${"library.jpg"})`;       
                    }
                    return `url(${"pub2.jpg"})`;
                }

            }
            return `url(${"covid1.jpg"})`;
        }

        const getTabs = () => {
            if (this.state.login_type === "nhs") {
                return (
                    <>
                        <Tabs style={{ backgroundColor: 'white', opacity: 0.7 }}
                            value={this.state.value}
                            onChange={this.handleChange}
                            initialSelectedIndex="1"
                            centered
                        >

                            <Tab label="Register New Patient" {...a11yProps(0)} />
                            <Tab label="Enter Covid Test Results" {...a11yProps(1)} />
                            <Tab label="Patient Trace" {...a11yProps(2)} />
                            <Tab label="Covid Vaccination" {...a11yProps(3)} />
                        </Tabs>
                        <TabPanel style={{ zIndex: 101 }} value={this.state.value} index={0}>
                            <Form
                                parent={this}
                                items={patientItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.patient}
                                title={"Register New Patient"}
                                action={"patient"}>
                            </Form>
                        </TabPanel>
                        <TabPanel value={this.state.value} index={1}>
                            <Form
                                parent={this}
                                items={resultItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.result}
                                title={"Enter Test Results"}
                                action={"result"}>
                            </Form>
                        </TabPanel>
                        <TabPanel value={this.state.value} index={2}>
                            <Form
                                parent={this}
                                items={matcherItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.matcher}
                                title={"Patient Matcher"}
                                action={"matcher"}
                                rows={this.state.matcher.displayRows}>
                            </Form>
                        </TabPanel>
                        <TabPanel value={this.state.value} index={3}>
                            <Form
                                parent={this}
                                items={vaccineItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.vaccine}
                                title={"Enter Vaccination Details"}
                                action={"vaccine"}>
                            </Form>
                        </TabPanel>
                    </>
                );
            } else {
                return (
                    <>
                        <Tabs style={{ backgroundColor: 'white', opacity: 0.7 }}
                            value={this.state.value}
                            onChange={this.handleChange}

                            initialSelectedIndex="1"
                            centered
                        >

                            <Tab label="Customer Check-In" {...a11yProps(0)} />
                            <Tab label="Request Immunity Certificate" {...a11yProps(1)} />
                        </Tabs>
                        <TabPanel value={this.state.value} index={0}>
                            <Form
                                parent={this}
                                items={visitItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.visit}
                                title={"Customer Visit Details"}
                                action={"visit"}>
                            </Form>
                        </TabPanel>
                        <TabPanel value={this.state.value} index={1}>
                            <Form
                                parent={this}
                                items={immunityItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.immunity}
                                title={"Request Covid Immunity Certificate"}
                                action={"immunity"}>
                            </Form>
                        </TabPanel>
                    </>
                );
            }
        }

        return (
            <ThemeProvider muiTheme={muiTheme} >
                <div style={{ width: 'calc(100vw - 1px)' }}>
                    <GlobalCss></GlobalCss>
                    <NavBar parent={this}></NavBar>

                    <Paper style={{
                        height: '800px',
                        backgroundImage: getImage(),
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "cover",
                        // backgroundAttachment: "fixed",
                        backgroundColor: 'rgba(10, 10, 10, 0.5)',
                        // flexGrow: 1
                    }}>
                        <WelcomeDialog
                            welcome_open={this.state.welcome_open}
                            credential_accepted={this.state.restaurant.credential_accepted}
                        >
                        </WelcomeDialog>
                        <div style={{ display: getTabDisplay() }}>
                            {getTabs()}
                        </div>
                    </Paper>
                    <LoginDialog
                        form_open={this.state.login_form_open}
                        parent={this}
                        collapse_open={this.state.collapse_open}>
                    </LoginDialog>
                    <RestaurantRegistrationDialog
                        form_open={this.state.register_restaurant_form_open}
                        parent={this}
                        loading={this.state.restaurant.loading}
                    >

                    </RestaurantRegistrationDialog>
                    <NHSRegistrationDialog
                        form_open={this.state.register_nhs_form_open}
                        parent={this}
                        loading={this.state.restaurant.loading}>
                    </NHSRegistrationDialog>
                    <Dialog open={this.state.qr_open} onClose={() => this.setState({ qr_open: false, qr_hasClosed: true })}>
                        <DialogTitle style={{ width: "300px" }}>{this.getQRCodeLabel()}</DialogTitle>
                        <QRcode size="200" value={this.state.invite_url} style={{ margin: "0 auto", padding: "10px" }} />
                    </Dialog>
                    <div style={{ zIndex: 100, textAlign: 'center', background: 'white', minWidth: '140px', minHeight: '50px', position: 'absolute', position: "fixed", top: '89%', left: '87%' }}>
                        <div>
                            Powered By
                        </div>
                        <img height="30" width="100" src="trinsic.png" alt="Trinsic"></img>
                    </div>
                </div >
            </ThemeProvider >
        )
    }
}