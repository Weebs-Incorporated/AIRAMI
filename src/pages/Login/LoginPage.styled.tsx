import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';

export const LoginPageContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5),
}));
