import { useContext } from 'react';
import { Typography, Stack } from '@mui/material';
import { HomeButton, LoginButton } from '../../components/Buttons';
import { IUserSessionContext, UserSessionContext } from '../../contexts';
import Footer from '../../components/Footer';

const ProfilePage = (props: IUserSessionContext<true>) => {
    return <div>ProfilePage</div>;
};

const ProfilePageWrapper = () => {
    const { user, controllers } = useContext(UserSessionContext);

    if (user === null) {
        return (
            <>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h2" gutterBottom>
                    Not Logged In
                </Typography>
                <Typography variant="subtitle2" color="gray">
                    You must be logged in to view this page.
                </Typography>
                <Stack direction="row" alignItems="center" sx={{ mt: 3 }} spacing={2}>
                    <HomeButton />
                    <LoginButton size="large" />
                </Stack>
                <Footer />
            </>
        );
    }

    return (
        <>
            <ProfilePage user={user} controllers={controllers} />
            <Footer />
        </>
    );
};

export default ProfilePageWrapper;
