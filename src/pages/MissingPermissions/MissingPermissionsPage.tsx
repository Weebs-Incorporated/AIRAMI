import { Typography } from '@mui/material';
import { HomeButton } from '../../components/Buttons';
import Footer from '../../components/Footer';
import SiteBreadcrumbs, { SiteBreadcrumbsProps } from '../../components/SiteBreadcrumbs';
import { Page } from '../Page.styled';

export interface MissingPermissionsPageProps {
    breadcrumbItems: SiteBreadcrumbsProps['items'];
    permissions: string[];
}

const MissingPermissionsPage = ({ breadcrumbItems }: { breadcrumbItems: SiteBreadcrumbsProps['items'] }) => (
    <>
        <SiteBreadcrumbs items={[{ to: '/', text: 'Home' }, ...breadcrumbItems]} />
        <Page>
            <div style={{ flexGrow: 1 }} />
            <Typography variant="h3" gutterBottom>
                Missing Permissions
            </Typography>
            <Typography color="gray" textAlign="center">
                You do not have permission to access this page.
            </Typography>
            <HomeButton sx={{ mt: 3 }} />
            <Footer />
        </Page>
    </>
);

export default MissingPermissionsPage;
