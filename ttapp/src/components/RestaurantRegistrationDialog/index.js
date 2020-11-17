import React from 'react';
import { TextField } from "@material-ui/core";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import Spinner from '../Spinner';

const RestaurantRegistrationDialog = ({ form_open, parent, loading }) => {
    let initialFormState =
    {
        restaurantname: '',
        restauranttelnumber: '',
        restaurantemail: '',
        restaurantlocation: '',
        restaurantpassword: ''
    };

    const [form, setFormState] = React.useState(initialFormState);

    const handleRegisterClose = () => {
        parent.registerRestaurantFormOpen(false);
    }

    const setFieldValue = (event) => {
        const { target: { name, value } } = event;
        setFormState({ ...form, [name]: value });
    }

    const handleFormSubmit = (event) => {
        event.preventDefault();
        parent.postRestaurantRegister(form);
    }

    return (
        <Dialog open={form_open} onClose={() => handleRegisterClose()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Register Venue</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To register a venue to this website, please enter venue name, email address and location here.
                                </DialogContentText>
                <Spinner active={loading}></Spinner>
                <form noValidate autoComplete="off" onSubmit={(e) => handleFormSubmit(e)}>
                    <TextField
                        margin="dense"
                        name="restaurantname"
                        label="Venue Name"
                        value={form.restaurantname}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restauranttelnumber"
                        label="Venue Telephone Number"
                        value={form.restaurantcontact}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restaurantemail"
                        label="Venue Email Address"
                        value={form.restaruantemail}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restaurantlocation"
                        label="Venue Location"
                        value={form.restaurantlocation}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restaurantpassword"
                        label="Password"
                        type="password"
                        value={form.restaurantpassword}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <DialogActions>
                        <Button onClick={() => handleRegisterClose()} color="primary">
                            Cancel
                    </Button>
                        <Button type="submit" color="primary">
                            Register
                    </Button>
                    </DialogActions>
                </form>
            </DialogContent>
        </Dialog>
    );
}
export default RestaurantRegistrationDialog