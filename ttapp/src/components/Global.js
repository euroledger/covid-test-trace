import {
    withStyles,
} from '@material-ui/core/styles';

const GlobalCss = withStyles({
    '@global': {
        '.MuiOutlinedInput-root': {
            borderRadius: 0,
            color: 'black',
            fontWidth: 900
        },
        '.MuiTab-wrapper': {
            color: 'black'
        },
        '.MuiInputBase-input': {
            color: 'gray'
        },
        '.MuiFormLabel-root.Mui-disabled': {
            color: 'gray'
        },
        '.PrivateTabIndicator-colorSecondary-3': {
            backgroundColor: 'black'
        },
        'MuiTableContainer-root': {
            height: '500px'
        },
        'MuiPaper-rounded': {
            height: '500px'
        }
    }


})(() => null);

export default GlobalCss;
