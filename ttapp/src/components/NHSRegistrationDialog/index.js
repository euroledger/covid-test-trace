import React from 'react';
import { TextField } from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';

const RestaurantRegistrationDialog = ({ form_open, parent }) => {
    let initialFormState =
    {
        nhsfirstname: '',
        nhslastname: '',
        nhslocation: '',
        nhsemail: '',
        nhspassword: '',
    };

    const [form, setFormState] = React.useState(initialFormState);

    const handleRegisterClose = () => {
        parent.registerNHSFormOpen(false);
    }

    const setFieldValue = (event) => {
        const { target: { name, value } } = event;
        setFormState({ ...form, [name]: value });
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();
        parent.postNHSRegister(form);
    }
    
    return (
        <Dialog open={form_open} onClose={() => handleRegisterClose()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Register NHS User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To register to this website, please enter your name and NHS id here.
                </DialogContentText>
                <form noValidate autoComplete="off" onSubmit={(e) => handleFormSubmit(e)}>
                    <TextField
                        margin="dense"
                        name="nhsfirstname"
                        label="First Name"
                        value={form.firstname}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="nhslastname"
                        label="Last Name"
                        value={form.lastname}
                        onChange={setFieldValue}
                        fullWidth
                    />
                     <TextField
                        margin="dense"
                        name="nhslocation"
                        label="Name of Medical Centre"
                        value={form.nhsid}
                        onChange={setFieldValue}
                        fullWidth
                    />
                     <TextField
                        margin="dense"
                        name="nhspassword"
                        label="Password"
                        type="password"
                        value={form.nhsid}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="nhsemail"
                        label="NHS Email"
                        value={form.nhsid}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <DialogActions>
                        <Button onClick={() => handleRegisterClose()} color="primary">
                            Cancel
                    </Button>
                        <Button type="submit" onClick={() => handleRegisterClose()} color="primary">
                            Register
                    </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
}
export default RestaurantRegistrationDialog