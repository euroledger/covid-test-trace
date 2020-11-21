import axios from 'axios';

const traceRoutes = {
    async issueTestCertificate(testDetails) {
        await axios.post('/api/testresult/issue', testDetails);
        console.log("WAITING FOR CREDENTIAL ACCEPTANCE...");
        await axios.post('/api/credential_accepted', null);

        console.log("READY!");
    },
    async issueVaccineCertificate(vaccinationDetails) {
        await axios.post('/api/vaccination/issue', vaccinationDetails);
        console.log("WAITING FOR CREDENTIAL ACCEPTANCE...");
        await axios.post('/api/credential_accepted', null);

        console.log("READY!");
    },
    async revoke() {
        await axios.post('/api/hospital/revoke', null);
    },
    async verifyNHSKey(immunity) {
        console.log(">>>> Going across to server");
        return await axios.post('/api/verifynhskey', {immunityType: immunity});
    },

    async verifyNHSPatient() {
        return await axios.post('/api/verifynhspatient', null);
    },
    
    async waitForVerificationReceived() {
        return await axios.get('/api/verificationreceived');
    },

    async requestVaccinationCertificate(certificate) {
        if (certificate === "vaccine") {
            return await axios.post('/api/verifyvaccinationcertificate', null);
        }else {
            return await axios.post('/api/verifypositivetestcertificate', null);
        }
    },

    async revokeTestCertificate() {
        await axios.post('/api/revokecertificate', null);
    },

    async issueNHSPatient(patientDetails) {
        await axios.post('/api/patient/issue', patientDetails);

        console.log("WAITING FOR CREDENTIAL ACCEPTANCE...");
        await axios.post('/api/credential_accepted', null);

        console.log("READY!");
    },

    async registerRestaurant(url, json) {
        return await axios.post(`${url}/restaurant`, json);

        // TODO error if email already in use
    },
    async registerNHSAdmin(url, json) {
        return await axios.post(`${url}/nhsadmin`, json);

        // TODO error if email already in use
    },
    async getRestaurant(url, email, password) {
        const query = `${url}/restaurant?restaurantemail=${email}&restaurantpassword=${password}`;
        return await axios.get(query);
    },
    async getNHSAdmin(url, email, password) {
        const query = `${url}/nhsadmin?nhsemail=${email}&nhspassword=${password}`;
        return await axios.get(query);
    },

    async saveVisitData(url, json) {
        return await axios.post(`${url}/visit`, json);
    },

    async searchForVisitsUsingKey(url, key) {
        const query = `${url}/visit?nhsappkey=${key}`;

        console.log("QUERY = ", query);
        return await axios.get(query);
    },

    // const visitors = await traceRoutes.searchForVisitsUsing(JSON_SERVER_URL, venueId, visitDate);
    async searchForVisitsUsingIdAndDate(url, venueid, date) {
        const query = `${url}/visit?restaurantid=${venueid}&visitdate=${date}`;
        return await axios.get(query);
    },

    async sendMessages(connectionIds) {
        await axios.post('/api/sendmessages', connectionIds);
    }

};

export default traceRoutes;