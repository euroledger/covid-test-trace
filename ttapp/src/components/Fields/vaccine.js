const vaccineItems = [
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
        id: "vaxid",
        label: "Vaccination Ref.",
        disabled: true
    },    
    {
        id: "testcentre",
        label: "NHS Vaccination Centre",
        disabled: true
    },
    {
        id: "vaxdate",
        label: "Vaccination Date",
        disabled: true
    },
    {
        id: "vaxtype",
        label: "Vaccine Type",
        type: "dropdown",
        menuItems: [
            "BioNTech/Pfizer",
            "Valneva",
            "AstraZeneca Oxford AZD1222",
            "Moldena",
            "Novavax",
            "SK/Sanofi Pasteur",
            "Janssen"
        ],
        disabled: false
    },
];

export default vaccineItems;