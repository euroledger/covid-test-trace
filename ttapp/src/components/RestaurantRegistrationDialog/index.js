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
            <DialogTitle id="form-dialog-title">Register Restaurant</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To register a restaurant to this website, please enter restaurant name, email address and location here.
                                </DialogContentText>
                <form noValidate autoComplete="off" onSubmit={(e) => handleFormSubmit(e)}>
                    <TextField
                        margin="dense"
                        name="restaurantname"
                        label="Restaurant Name"
                        value={form.restaurantname}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restauranttelnumber"
                        label="Restaurant Telephone Number"
                        value={form.restaurantcontact}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restaurantemail"
                        label="Restaurant Email Address"
                        value={form.restaruantemail}
                        onChange={setFieldValue}
                        fullWidth
                    />
                    <TextField
                        margin="dense"
                        name="restaurantlocation"
                        label="Restaurant Location"
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