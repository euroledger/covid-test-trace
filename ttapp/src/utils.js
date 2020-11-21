const formatTime = (d, addHours) => {
    var hours = '' + d.getHours();
    var minutes = '' + d.getMinutes();
    var seconds = '' + d.getSeconds();

    if (addHours != undefined) {
        hours = '' + ((d.getHours() + addHours) % 24); // for testing set departure time x hours ahead
        
    }

    // if (hours === 24) hours = 0;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;
    if (seconds.length < 2) seconds = '0' + seconds;

    return [hours, minutes, seconds].join(':');
}

const formatDate = (date, addYears) => {
    if (addYears === undefined) {
        addYears = 0;
    }
    var d = new Date(date),
        month = '' + (d.getMonth() + 1), // add 1 as January = 0
        day = '' + d.getDate(),
        year = d.getFullYear() + addYears;

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}  

module.exports = {
    formatTime: formatTime,
    formatDate: formatDate
}