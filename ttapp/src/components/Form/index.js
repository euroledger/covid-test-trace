import React from 'react';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/es/Typography/Typography";
import { TextField } from "@material-ui/core";
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Table from '../Table';
import './form.css';
import Spinner from '../Spinner';

const Form = ({ parent, items, loading, card, title, action, rows }) => {
    const useStyles = makeStyles((theme) => ({
        formControl: {
            margin: 0,
            minWidth: 150,

        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }));

    const getTable = () => {
        if (action === "matcher") {
            return (
                <Table rows={rows}></Table>
            );
        }
    }

    const getButton = () => {
        if (action === "patient") {
            return parent.patientButton();
        } else if (action === "result") {
            return parent.resultButton();
        } else if (action === "visit") {
            return parent.visitButton();
        } else if (action === "matcher") {
            return parent.matcherButton();
        } else if (action === "vaccine") {
            return parent.vaccineButton();
        } else if (action === "immunity") {
            return parent.immunityButton();
        }
    }

    const getLogo = () => {
        if (action === "visit") {
            return (
                <img style={{ marginLeft: '202px', height: '107px', width: '149px', marginBottom: '24px' }} src='food.jpg' alt="" />
            )
        }
        else if (action === "patient") {
            return (
                <img style={{ marginLeft: '194px', height: '98px', width: '165px' }} src='nsh.jpg' alt="" />
            )
        }
        else if (action === "result") {
            return (
                <img style={{ marginLeft: '237px', height: '98px', width: '165px' }} src='nurse.jpg' alt="" />
            )
        }
        else if (action === "matcher") {
            return (
                <img style={{ marginLeft: '438px', height: '98px', width: '165px' }} src='trace.jpg' alt="" />
            )
        }
        else if (action === "vaccine") {
            return (
                <img style={{ marginLeft: '165px', height: '98px', width: '165px' }} src='nurse.jpg' alt="" />
            )
        }
        else if (action === "immunity") {
            return (
                <img style={{ marginLeft: '165px', height: '98px', width: '165px' }} src='immunity.jpg' alt="" />
            )
        }
    }

    const getDivStyle = () => {
        if (action === "policy") {
            return ({ display: 'flex', marginBottom: '-65px' })
        } else if (action === "result") {
            return ({ display: 'flex', marginBottom: '-3px' })
        }
    }

    const setFieldValue = (event) => {
        if (action === "patient") {
            parent.setPatientFieldValue(event);
        } else if (action === "result") {
            parent.setResultFieldValue(event);
        } else if (action === "visit") {
            parent.setVisitFieldValue(event);
        } else if (action === "vaccine") {
            parent.setVaccineFieldValue(event);
        } else if (action === "immunity") {
            parent.setImmunityFieldValue(event);
        }
    }

    const classes = useStyles();

    const getMenuItems = (menuItems) => {
        return menuItems.map(item =>
            <MenuItem value={item}>{item}</MenuItem>
        )
    }

    const getWidth = () => {
        if (action === "matcher") {
            return '830px';
        }
        return '650px';
    }
    const getHeight = () => {
        if (action === "matcher") {
            return '700px';
        }
        return 'auto';
    }

    const getRevoked = () => {
        if (action != "immunity") {
            return "none";
        }
        return card.revoked ? "block" : "none";
    }

    const getFields = () => {
        return items.map(item => {
            if (item.type === "dropdown") {
                return (
                    <FormControl className={classes.formControl}>
                        <InputLabel id="simple-select-label">{item.label}</InputLabel>
                        <Select
                            name={item.id}
                            value={card[item.id]}
                            onChange={setFieldValue}
                        >
                            {getMenuItems(item.menuItems)}
                        </Select>
                    </FormControl>
                )
            } else {
                return (
                    <TextField
                        name={item.id}
                        disabled={item.disabled}
                        label={item.label}
                        value={card[item.id]}
                        onChange={setFieldValue}
                        style={{ marginBottom: '8px' }}
                    />
                )

            }
        });
    }
   
    return (
        <div style={{ display: 'flex', justifyContent: 'center', height: getHeight(), opacity: 0.9 }}>
            <Paper style={{ display: 'flex', maxWidth: '1000px', width: getWidth() }}>
                <div style={{ display: 'flex', padding: '24px 24px', flexDirection: 'column', width: '100%' }}>
                    <div style={getDivStyle()}>
                        <Typography variant="h5" style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex' }}>
                                <div>
                                    {title}
                                </div>
                                <div>
                                    {getLogo()}
                                </div>
                            </div>
                        </Typography>
                    </div>

                    <Spinner active={loading}></Spinner>
                    {getFields()}
                    <div style={{ display: getRevoked() }} className="revoke">REVOKED</div>
                    {getTable()}
                    {getButton()}
                </div>
            </Paper>
        </div>
    );
}

export default Form;