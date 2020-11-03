import React from 'react';

const WelcomeDialog = ({ welcome_open, credential_accepted }) => {

    const getWelcomeDisplay = () => {
        return welcome_open ? 'block' : 'none';
    }

    const getWaitingDisplay = () => {
        return credential_accepted ? 'none' : 'block';
    }

    // const getWelcomeDisplay = () => {
    //     return welcome_open ? 'none' : 'block';
    // }

    // const getWaitingDisplay = () => {
    //     return credential_accepted ? 'block' : 'none';
    // }

    return (
        <div style={{ display: getWelcomeDisplay() }} className="welcomepanel">
            <div style={{ borderBottom: '1px solid white', textAlign: 'center' }}>
                <p>Welcome to EuroLedger Test &amp; Trace</p>
            </div>
            <div style={{ marginTop: '35px', lineHeight: '25px', textAlign: 'justify' }}>
                <p> Click on "Register Restaurant" to create a new [Restaurant] user account, "Register NHS Admin" to register a new[NHS Admin] user account or "Login" to sign in with an existing account.
                </p>
                <div style={{ display: getWaitingDisplay() }} className="bottomright">
                    Awaiting User Registration Credential Acceptance...
                </div>
            </div>
        </div>
    );
}
export default WelcomeDialog