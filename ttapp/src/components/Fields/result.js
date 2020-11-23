const resultItems = [
    {
        id: "patientid",
        label: "NHS Patient Reference",
        disabled: true
    },
    {
        id: "patientname",
        label: "Patient Name",
        disabled: true
    },
    {
        id: "certificateid",
        label: "Test Certificate Ref.",
        disabled: true
    },    
    {
        id: "testcentre",
        label: "NHS Test Centre",
        disabled: true
    },
    {
        id: "testtype",
        label: "Test Type",
        disabled: true
    },
    {
        id: "testdate",
        label: "Covid Test Date",
        disabled: true
    },
    {
        id: "testresult",
        label: "Covid Test Result",
        type: "dropdown",
        menuItems: [
            "POSITIVE",
            "NEGATIVE",
            "ANTIBODY",
            "NO RESULT"
        ],
        disabled: false
    },
];

export default resultItems;