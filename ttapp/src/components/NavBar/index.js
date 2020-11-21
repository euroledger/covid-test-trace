import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Typography from "@material-ui/core/es/Typography/Typography";
import Button from '@material-ui/core/Button';
import { createGenerateClassName } from '@material-ui/core';

const NavBar = ({ parent }) => {

    const clickHandler = () => {
        if (parent.state.login === true) {
            parent.logout()
        } else {
            parent.postLogin()
        }
    }

    const getName = () => {
        const name = sessionStorage.getItem("name");
        const welcomeStr = parent.state.login_type === "nhs" ? "NHS Covid Test Centre: " : "Welcome to";
        return name === '' || parent.state.login === false ? '' : `${welcomeStr} ${name}`;
    }

    const getBackgroundColor = () => {
        if (parent.state.login_type === "nhs") {
            return '#2e5cb8';
        } else if (parent.state.login_type === "restaurant") {
            return '#800000'
        } else {
            return '#004d00';
        }

    }

    const getLogo = () => {
        if (parent.state.login_type === "nhs") {
            return <img style={{ maxHeight: '40px', paddingRight: '30px' }} src="nhs.png" alt="logo" />
        }
    }
    return (
        <AppBar position="static">
            <Toolbar style={{ backgroundColor: getBackgroundColor() }}>
                <img style={{ maxHeight: '40px', paddingRight: '30px' }} src="EL2.jpg" alt="logo" />
                <Typography variant="h6">
                    EuroLedger Covid Test, Trace &amp; Vaccine Demo
                </Typography>
                <div style={{ flexGrow: 1, textAlign: 'center' }}>
                    {getLogo()}
                    <div >{getName()}
                    </div>
                </div>

                <Button style={{ color: 'white' }} onClick={() => parent.registerRestaurantFormOpen(true)}>
                    {parent.getRegisterRestaurantLabel()}
                </Button>
                <Button style={{ color: 'white' }} onClick={() => parent.registerNHSFormOpen(true)}>
                    {parent.getRegisterNHSLabel()}
                </Button>
                <Button style={{ color: 'white' }} onClick={() => clickHandler()}>
                    {parent.getLoginLabel()}
                </Button>
            </Toolbar>
        </AppBar>
    )
};

export default NavBar
