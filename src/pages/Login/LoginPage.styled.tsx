import { Container, styled } from '@mui/material';

export const LoginPageContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexFlow: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5),
}));
