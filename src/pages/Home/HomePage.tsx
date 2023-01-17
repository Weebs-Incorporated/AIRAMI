import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useContext } from 'react';
import { LoginButton, ProfileButton } from '../../components/Buttons';
import { GithubLink, InternalLink } from '../../components/Links';
import { UserSessionContext } from '../../contexts';

export const HomePage = () => {
    const { user } = useContext(UserSessionContext);

    return (
        <>
            <Typography variant="h1">AIRAMI</Typography>
            <Typography variant="subtitle2" color="gray" sx={{ pl: 1, pr: 1 }} textAlign="center">
                Anime Image Retrieval And Modification Interface
            </Typography>
            <InternalLink to="/settings">
                <Button variant="outlined" color="secondary" sx={{ mt: 3 }} size="large">
                    Settings
                </Button>
            </InternalLink>
            {user === null ? (
                <LoginButton sx={{ mt: 3 }} size="large" />
            ) : (
                <ProfileButton user={user.userData} size="small" sx={{ mt: 3 }} />
            )}
            <GithubLink sx={{ position: 'absolute', bottom: '1%', right: '1%' }} />
        </>
    );
};
