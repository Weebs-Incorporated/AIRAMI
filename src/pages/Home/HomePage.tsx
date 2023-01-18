import { Typography } from '@mui/material';
import Footer from '../../components/Footer';

const HomePage = () => (
    <>
        <div style={{ flexGrow: 1 }} />
        <Typography variant="h1">AIRAMI</Typography>
        <Typography variant="subtitle2" color="gray" sx={{ pl: 1, pr: 1 }} textAlign="center">
            Anime Image Retrieval And Modification Interface
        </Typography>
        <Footer />
    </>
);

export default HomePage;
