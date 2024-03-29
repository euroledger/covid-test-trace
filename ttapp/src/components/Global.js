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
        '.MuiTab-root': {
            maxWidth: '284px'
        },  
        // 
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
        },
        'MuiTabs-fixed': {
            backgroundColor: 'red'
        },
    }


})(() => null);

export default GlobalCss;