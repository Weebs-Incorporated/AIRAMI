import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useContext } from 'react';
import { LoginButton, ProfileButton } from '../../components/Buttons';
import { InternalLink } from '../../components/Links';
import { UserSessionContext } from '../../contexts';

export const HomePage = () => {
    const { user } = useContext(UserSessionContext);

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
            {user === null ? <LoginButton /> : <ProfileButton user={user.userData} />}
        </>
    );
};
