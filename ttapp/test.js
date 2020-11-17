// module to load test data into json server

const axios = require('axios');
const crypto = require('crypto');
// const { sleep } = require('sleep');
const utils = require('./src/utils');

console.log("Hello World");
const JSON_SERVER_URL = 'http://localhost:3004';

saveData = async (visit) => {
    return await axios.post(`${JSON_SERVER_URL}/visit`, visit);
}

getVenueData = async () => {
    return await axios.get(`${JSON_SERVER_URL}/restaurant`);
}

generateKey = () => {
    // cb01c342-11b9-4687-b0de-22e93da99031
    return crypto.randomBytes(4).toString('hex') + "-" + crypto.randomBytes(2).toString('hex') + "-"  + crypto.randomBytes(2).toString('hex') + "-" + crypto.randomBytes(2).toString('hex') + "-" + crypto.randomBytes(6).toString('hex');
}

function randomIntFromInterval(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
  
generateVisitData = (venues) => {
    const key = generateKey();
    const venueId = Math.floor(Math.random() * venues.length) + 1;
    // const d = randomDate(new Date(2020, 10, 1), new Date());

    const d = new Date(); // today
    const hours = randomIntFromInterval(10,21);
    d.setHours(hours);
    const visitDate = utils.formatDate(d, 0);
    const visitTimeIn = utils.formatTime(d);
    const visitTimeOut = utils.formatTime(d, 3);
    return {
        nhsappkey: key,
        restaurantname: venues[venueId - 1].restaurantname,
        restaurantid: venueId,
        visitdate: visitDate,
        visittimein: visitTimeIn,
        visittimeout: visitTimeOut
    }
}

function sleepFor( sleepDuration ){
    var now = new Date().getTime();
    while(new Date().getTime() < now + sleepDuration){ /* do nothing */ } 
}

main = async () => {
    const key = generateKey();
    console.log ("key = ", key);

    const resp = await getVenueData();

    for (let i = 0; i < 100; i++) {
        const visit = generateVisitData(resp.data);
        console.log(visit);
        sleepFor(10);
        await saveData(visit);
    }
  
}

main();

