import React, { Component } from 'react';
import './button.css';
import patientItems from './components/Fields/patient';
import visitItems from './components/Fields/visit';
import resultItems from './components/Fields/result';
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
import QRcode from 'qrcode.react';
import traceRoutes from './routes/restaurant';
import signInRoutes from './routes/signInRoutes';
import LoginDialog from './components/LoginDialog';

axios.defaults.baseURL = 'http://localhost:3002/';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const r = Math.random().toString(26).substring(2, 4).toUpperCase();

const invoiceNumber = r + Math.floor(1000 + Math.random() * 9000).toString();

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
// {
//     id: "patientid",
//     id: "testcentre",
//     id: "patientname",
//     id: "testdate",
//     id: "testresult",
// },
const initState = {
    visit: {
        nhsappkey: "",
        restaurantname: "",
        restaurantid: -1,
        visitdate: "",
        visittime: "",
    },
    patient: {
        patientid: "",
        testandtracekey: "",
    },
    result: {
        patientid: "",
        testcentre: "",
        patientname: "",
        testdate: "",
        testresult: "",
    },

    collapse_open: false,
    qr_open: false,
    welcome_open: true,
    qr_hasClosed: false,
    qr_placeholder: "",
    invite_url: "",
    login_url: "",
    registering_restaurant: false,
    registering_nhs_user: false,
    loggingIn: false,
    restaurant: {
        qr_feedbackCollected: false,
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
    collapse_open: false,
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

    onIssueInvoice = async () => {
        const invoiceDetails = {
            invoiceNumber: invoiceNumber,
            hospitalName: this.state.invoice.hospitalName,
            invoiceDate: this.state.invoice.invoiceDate,
            insurancePolicyNumber: this.state.invoice.insurancePolicyNumber,
            amount: this.state.invoice.invoiceAmount + ".00",
            treatmentDescription: this.state.invoice.treatmentDescription
        }

        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, credential_accepted: false }
        }));

        await traceRoutes.issue(invoiceDetails);

        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, credential_accepted: true, has_been_revoked: false },
            invoice: { ...prevState.invoice, invoiceNumber: invoiceNumber }
        }));
    }

    onRequestNHSKey = async () => {
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, nhs_key_received: false },
        }));
        let resp;
        try {
            resp = await traceRoutes.verifyNHSKey();
        }
        catch (e) {
            console.log(e);
        }
        this.setState(prevState => ({
            restaurant: { ...prevState.restaurant, nhs_key_received: true, claim_button_disabled: false },
            policy: {
                ...prevState.policy,
                policyID: resp.data.policyID,
                effectiveDate: resp.data.effectiveDate,
                expiryDate: resp.data.expiryDate,
                insuranceCompany: resp.data.insuranceCompany,
            },
            invoice: {
                ...prevState.invoice,
                insurancePolicyNumber: resp.data.policyID,
            }
        }));
        console.log("LOGIN ok! resp = ", resp);
    }

    setPolicyFieldValue = (event) => {
        const { target: { name, value } } = event;

        this.setState(prevState => ({
            user: {
                ...prevState.user, [name]: value
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
                    CreationDate: this.formatDate(d)
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
        sessionStorage.setItem("name", "Bollocks");
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
        const json = JSON.stringify(form);
        sessionStorage.setItem("name", form.restaurantname);

        this.setState(prevState => ({
            restaurant: {
                ...prevState.restaurant, name: form.restaurantname
            }
        }));
        const res = await traceRoutes.registerRestaurant(JSON_SERVER_URL, json);
        this.setLoginDetails("restaurant");
    }

    postNHSRegister = async (form) => {
        // write NHS admin registration data to json server
        const json = JSON.stringify(form);
        sessionStorage.setItem("name", form.nhslocation);
        const res = await traceRoutes.registerNHSAdmin(JSON_SERVER_URL, json);
        this.setLoginDetails("nhs");
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
            console.log("FOUND! id = ", res.data[0].id);
            sessionStorage.setItem("name", res.data[0].restaurantname);
            this.setLoginDetails("restaurant");
         

            this.setState(prevState => ({
                visit: {
                    ...prevState.visit, restaurantname: res.data[0].restaurantname, restaurantid: res.data[0].id
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
            registering_nhs_user: true
        });
    }


    formatDate = (date, addYears) => {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1), // add 1 as January = 0
            day = '' + d.getDate(),
            year = d.getFullYear() + addYears;

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
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
                CreationDate: this.formatDate(d)
            }
        }));

        window.stop();
        sessionStorage.setItem("waitingForrestaurantUserData", "false");
        // sessionStorage.setItem("restaurantUserData", JSON.stringify(this.state.user));
        // sessionStorage.setItem("restaurantStateData", JSON.stringify(this.state.restaurant));
        sessionStorage.setItem("state", JSON.stringify(this.state));

        this.setState({ value: 0 });
    }

    getCancelInvoiceLabel(platform) {
        return (this.state.restaurant.credential_accepted ? "Cancel Invoice" : "Awaiting Acceptance...");
    }

    getNHSKeyLabel() {
        return (this.state.restaurant.verification_received ? "Request NHS Test & Trace Key" : "Awaiting Verification...");
    }

    getInvoiceLabel() {
        return (this.state.restaurant.credential_accepted ? "Issue Test Certificate Credential" : "Awaiting Acceptance...");
    }

    getDisabled(platform) {
        return (!this.state[platform].credential_accepted || !(this.state.restaurant.nhs_key_received));
    }

    getClaimDisabled(platform) {
        return (!this.state[platform].credential_accepted || !(this.state.restaurant.nhs_key_received) || (this.state.restaurant.claim_button_disabled));
    }

    requestPolicyButton() {
        return (
            <div style={{ marginTop: '50px', }}>
                <Button className="registerbutton" disabled={this.getDisabled("restaurant")}
                    onClick={() => this.onRequestNHSKey()} >
                    {this.getNHSKeyLabel("restaurant")}
                </Button>
            </div>
        )
    }

    resultButton() {
        if (this.state.restaurant.has_been_revoked) {
            return (
                <div style={{ marginTop: '45px', marginBottom: '20px' }}>
                    <Button className="registerbutton" disabled={this.getClaimDisabled("restaurant")}
                        onClick={() => this.onIssueInvoice()} >
                        {this.getInvoiceLabel()}
                    </Button>
                </div>
            )
        } else {
            return (
                <div style={{ marginTop: '45px', marginBottom: '20px' }}>
                    <Button className="revokebutton" disabled={this.getDisabled("restaurant")}
                        onClick={() => this.onReimburse()} >
                        {this.getCancelInvoiceLabel()}
                    </Button>
                </div>
            )
        }
    }

    getQRCodeLabel() {
        return this.state.registering_restaurant ? "Scan this QR code to Register a Restaurant with EuroLedger Test & Trace" : this.state.registering_nhs_user ? "Scan this QR Code to register as an NHS Administrator with EuroLedger Test & Trace" : "Scan this QR code to Login to EuroLedger Test & Trace"
    }

    handleLoginClose() {
        this.setState({
            login_form_open: false
        });
    }

    startLoader() {
        this.setState({
            loading: true
        });
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
        const name = sessionStorage.getItem("name");
        return this.state.register_restaurant || this.state.register_nhs ? "" : "Register Restaurant";
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
        const card = this.state;


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
                    return `url(${"pub2.jpg"})`;
                }

            }
            return `url(${"covid1.jpg"})`;
        }

        const getTabs = () => {
            if (this.state.login_type === "nhs") {
                return (
                    <>
                        <Tabs
                            value={this.state.value}
                            onChange={this.handleChange}

                            initialSelectedIndex="1"
                            centered
                        >

                            <Tab label="Register New Patient" {...a11yProps(0)} />
                            <Tab label="Enter Covid Test Results" {...a11yProps(1)} />
                        </Tabs>
                        <TabPanel value={this.state.value} index={0}>
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
                    </>
                );
            } else {
                return (
                    <>
                        <Tabs
                            value={this.state.value}
                            onChange={this.handleChange}

                            initialSelectedIndex="1"
                            centered
                        >

                            <Tab label="Receive New Customer" {...a11yProps(0)} />
                            <Tab label="Customer Matcher" {...a11yProps(1)} />
                        </Tabs>
                        <TabPanel value={this.state.value} index={0}>
                            <Form
                                parent={this}
                                items={visitItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.visit}
                                title={"Customer Visit Details"}
                                action={"policy"}>
                            </Form>
                        </TabPanel>
                        <TabPanel value={this.state.value} index={1}>
                            <Form
                                parent={this}
                                items={patientItems}
                                loading={this.state.restaurant.loading}
                                card={this.state.invoice}
                                title={"Raise Patient Invoice"}
                                action={"invoice"}>
                            </Form>
                        </TabPanel>
                    </>
                );
            }
        }

        return (
            <ThemeProvider muiTheme={muiTheme} >
                <div >
                    <GlobalCss></GlobalCss>
                    <NavBar parent={this}></NavBar>

                    <Paper style={{
                        height: '800px',
                        backgroundImage: getImage(),
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center center",
                        backgroundSize: "cover",
                        backgroundAttachment: "fixed",
                        backgroundColor: 'rgba(10, 10, 10, 0.5)',
                        flexGrow: 1
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
                        parent={this}>
                    </RestaurantRegistrationDialog>
                    <NHSRegistrationDialog
                        form_open={this.state.register_nhs_form_open}
                        parent={this}>
                    </NHSRegistrationDialog>
                    <Dialog open={this.state.qr_open} onClose={() => this.setState({ qr_open: false, qr_hasClosed: true })}>
                        <DialogTitle style={{ width: "300px" }}>{this.getQRCodeLabel()}</DialogTitle>
                        <QRcode size="200" value={this.state.invite_url} style={{ margin: "0 auto", padding: "10px" }} />
                    </Dialog>
                </div >
            </ThemeProvider >
        )
    }
}