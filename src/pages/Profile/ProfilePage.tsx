import { useContext } from 'react';
import { Typography, Stack, Button } from '@mui/material';
import { LoginButton } from '../../components/Buttons';
import { InternalLink } from '../../components/Links';
import { IUserSessionContext, UserSessionContext } from '../../contexts';

const ProfilePage = (props: IUserSessionContext<true>) => {
    return <div>ProfilePage</div>;
};

const ProfilePageWrapper = () => {
    const { user, controllers } = useContext(UserSessionContext);

    if (user === null) {
        return (
            <>
                <Typography variant="h2" gutterBottom>
                    Not Logged In
                </Typography>
                <Typography variant="subtitle2" color="gray">
                    You must be logged in to view this page.
                </Typography>
                <Stack direction="row" alignItems="center" sx={{ mt: 3 }} spacing={2}>
                    <InternalLink to="/">
                        <Button variant="outlined" color="secondary" size="large">
                            Home
                        </Button>
                    </InternalLink>
                    <LoginButton size="large" />
                </Stack>
            </>
        );
    }

    return <ProfilePage user={user} controllers={controllers} />;
};

export default ProfilePageWrapper;
