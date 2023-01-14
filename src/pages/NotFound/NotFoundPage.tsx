import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { InternalLink } from '../../components/Links';

export const NotFoundPage = () => {
    return (
        <>
            <Typography variant="h2">Not Found</Typography>
            <Typography variant="subtitle2" color="gray">
                The page you are looking for does not exist.
            </Typography>
            <InternalLink to="/">
                <Button variant="outlined" color="secondary" sx={{ mt: 3 }} size="large">
                    Home
                </Button>
            </InternalLink>
        </>
    );
};
