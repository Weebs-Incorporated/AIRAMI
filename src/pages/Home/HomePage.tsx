import { Link, Typography } from '@mui/material';
import Footer from '../../components/Footer';
import { InternalLink } from '../../components/Links';

const HomePage = () => {
    return (
        <>
            <div style={{ flexGrow: 1 }} />
            <Typography variant="h1">AIRAMI</Typography>
            <Typography variant="subtitle2" color="gray" sx={{ pl: 1, pr: 1, mb: 3 }} textAlign="center">
                Anime Image Retrieval And Modification Interface
            </Typography>
            <InternalLink to="/users/240312568273436674">
                <Link underline="hover" component="span">
                    Go to a cool person's profile
                </Link>
            </InternalLink>
            <Footer />
        </>
    );
};

export default HomePage;
