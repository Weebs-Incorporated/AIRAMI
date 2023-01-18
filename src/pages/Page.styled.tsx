import { Container, styled } from '@mui/material';

export const Page = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing(1),
    flexGrow: 1,
}));
