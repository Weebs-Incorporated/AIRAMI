import { Button, Typography } from '@mui/material';
import Footer from '../../components/Footer';
import { InternalLink } from '../../components/Links';

const NotFoundPage = () => (
    <>
        <div style={{ flexGrow: 1 }} />
        <Typography variant="h2">Not Found</Typography>
        <Typography variant="subtitle2" color="gray">
            The page you are looking for does not exist.
        </Typography>
        <InternalLink to="/">
            <Button variant="outlined" color="secondary" sx={{ mt: 3 }} size="large">
                Home
            </Button>
        </InternalLink>
        <Footer />
    </>
);

export default NotFoundPage;
