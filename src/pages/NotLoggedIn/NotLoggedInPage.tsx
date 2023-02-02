import { Stack, Typography } from '@mui/material';
import { HomeButton, LoginButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs, { SiteBreadcrumbsProps } from '../../components/SiteBreadcrumbs';
import { Page } from '../Page.styled';

const NotLoggedInPage = ({ breadcrumbItems }: { breadcrumbItems: SiteBreadcrumbsProps['items'] }) => {
    return (
        <>
            <SiteBreadcrumbs items={[{ to: '/', text: 'Home' }, ...breadcrumbItems]} />
            <Page>
                <div style={{ flexGrow: 1 }} />
                <Typography variant="h3" gutterBottom>
                    Not Logged In
                </Typography>
                <Typography color="gray" textAlign="center">
                    You must be logged in to access this page.
                </Typography>
                <Stack direction="row" sx={{ mt: 3 }} spacing={2}>
                    <HomeButton />
                    <LoginButton size="large" />
                </Stack>
                <Footer />
            </Page>
        </>
    );
};

export default NotLoggedInPage;
