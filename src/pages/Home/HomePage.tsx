import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { LoginButton } from '../../components/Buttons';
import { InternalLink } from '../../components/Links';

export const HomePage = () => {
    return (
        <>
            <Typography variant="h1">AIRAMI</Typography>
            <Typography variant="subtitle2" color="gray">
                Anime Image Retrieval And Modification Interface
            </Typography>
            <InternalLink to="/settings">
                <Button variant="outlined" color="secondary" sx={{ mt: 3 }} size="large">
                    Settings
                </Button>
            </InternalLink>
            <LoginButton />
        </>
    );
};
