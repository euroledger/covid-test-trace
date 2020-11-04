import axios from 'axios';

const traceRoutes = {
    async issue(policyDetails) {
        await axios.post('/api/hospital/issue', policyDetails);
        console.log("WAITING FOR CREDENIAL ACCEPTANCE...");
        await axios.post('/api/credential_accepted', null);

        console.log("READY!");
    },
    async revoke() {
        await axios.post('/api/hospital/revoke', null);
    },
    async verifyNHSKey() {
        await axios.post('/api/verifynhskey', null);

        return await axios.get('/api/verificationreceived');
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
        console.log("firing query to json server: ", query);
        return await axios.get(query);
    },
    async getNHSAdmin(url, email, password) {
        const query = `${url}/nhsadmin?nhsemail=${email}&nhspassword=${password}`;
        console.log("firing query to json server: ", query);
        return await axios.get(query);
    }
};

export default traceRoutes;