const immunityItems = [
    {
        id: "patientname",
        label: "Certificate Holder Full Name",
        disabled: true
    },
    {
        id: "restaurantname",
        label: "Venue",
        disabled: true
    },
    {
        id: "immunitytype",
        label: "Type of Certificate",
        type: "dropdown",
        menuItems: [
            "POSITIVE COVID TEST",
            "VACCINE CERTIFICATE",
            "ANTIBODY CERTIFICATE"
        ],
        disabled: false
    },
    {
        id: "certificatetype",
        label: "Type of Immunity",
        disabled: true
    },
    {
        id: "immunitydate",
        label: "Date of Issue of Certificate",
        disabled: true
    },
    {
        id: "testcentre",
        label: "NHS Issuing Authority",
        disabled: true
    },
    {
        id: "immunityreference",
        label: "Certificate Reference",
        disabled: true
    },  
];

export default immunityItems;
