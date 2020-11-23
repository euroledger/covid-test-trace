import React from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: 'rgb(46, 92, 184)',
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 700, 
    overflowY: 'auto'    
  },
});

export default function CustomizedTables({ rows }) {
  const classes = useStyles();

  return (
    <TableContainer style={{height: 'auto', minHeight: '100px'}} component={Paper}>
      <Table stickyHeader className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>NHS Test &amp; Trace Key</StyledTableCell>
            <StyledTableCell align="left">Venue</StyledTableCell>
            <StyledTableCell align="left">Date</StyledTableCell>
            <StyledTableCell align="left">Time In</StyledTableCell>
            <StyledTableCell align="left">Time Out</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <StyledTableRow key={row.key}>         
              <StyledTableCell align="left">{row.nhsappkey}</StyledTableCell>
              <StyledTableCell align="left">{row.restaurantname}</StyledTableCell>
              <StyledTableCell align="left">{row.visitdate}</StyledTableCell>
              <StyledTableCell align="left">{row.visittimein.substring(0,5)}</StyledTableCell>
              <StyledTableCell align="left">{row.visittimeout.substring(0,5)}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}