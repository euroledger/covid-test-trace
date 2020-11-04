import React from 'react';
import { TextField } from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';

const LoginDialog = ({ form_open, parent, collapse_open }) => {
    let initialFormState =
    {
        email: '',
        password: ''
    };

    const [form, setFormState] = React.useState(initialFormState);

    const handleLoginClose = async () => {
        await parent.loginFormOpen();
    }

    const setFieldValue = (event) => {
        const { target: { name, value } } = event;
        setFormState({ ...form, [name]: value });
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();
        parent.checkLoginInfo(form);
    }

    return (
        <Dialog open={form_open} onClose={() => handleLoginClose()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">User Sign-In</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter your email address and password here to Sign In
                </DialogContentText>
                <form noValidate autoComplete="off" onSubmit={(e) => handleFormSubmit(e)}>
                    <TextField
                        margin="dense"
                        name="email"
                        label="Email Address"
                        value={form.email}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="password"
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <DialogActions>
                        <Button onClick={() => handleLoginClose()} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Login
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
            <Collapse in={collapse_open} style={{
                position: 'absolute',
                top: '40%',
                left: '25%',
                width: '20rem'
            }}>
                <Alert
                    severity="error"
                    action={
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                                parent.setCollapseClosed()
                            }}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    }
                >
                    Invalid User Name or Password. Please try again.
                                        </Alert>
            </Collapse>
        </Dialog>
    );
}
export default LoginDialog