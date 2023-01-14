import { createTheme, responsiveFontSizes } from '@mui/material';

let theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

theme = responsiveFontSizes(theme);

export default theme;
