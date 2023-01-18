import { Typography } from '@mui/material';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';

const NotFoundPage = () => (
    <>
        <div style={{ flexGrow: 1 }} />
        <Typography variant="h2">Not Found</Typography>
        <Typography variant="subtitle2" color="gray">
            The page you are looking for does not exist.
        </Typography>
        <HomeButton sx={{ mt: 3 }} />
        <Footer />
    </>
);

export default NotFoundPage;
