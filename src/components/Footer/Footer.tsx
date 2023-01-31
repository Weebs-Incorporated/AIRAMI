import { useContext } from 'react';
import { Grid, Paper, PaperProps } from '@mui/material';
import { SettingsContext, UserSessionContext } from '../../contexts';
import FooterItem from './FooterItem';

import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import ListIcon from '@mui/icons-material/List';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import { hasOneOfPermissions } from '../../helpers';
import { UserPermissions } from '../../types/AIMS';

const Footer = (props?: PaperProps) => {
    const { settings } = useContext(SettingsContext);

    const { user } = useContext(UserSessionContext);

    return (
        <>
            <div style={{ flexGrow: 1 }} />
            <Paper
                {...props}
                sx={{
                    width: '100vw',
                    p: 2,
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    ...props?.sx,
                }}
                square={props?.square ?? true}
            >
                <Grid container spacing={2} justifyContent="space-around" alignItems="center">
                    <FooterItem href="/" icon={<HomeIcon color="disabled" />} label="Home" type="internal" />
                    {user !== null && (
                        <FooterItem
                            href={`/users/${user.userData._id}`}
                            icon={<ProfilePicture user={{ ...user.userData }} size={24} style={{ color: 'gray' }} />}
                            label="Profile"
                            type="internal"
                        />
                    )}
                    {user !== null &&
                        hasOneOfPermissions(
                            user.userData,
                            UserPermissions.Owner,
                            UserPermissions.AssignPermissions,
                            UserPermissions.Audit,
                        ) && (
                            <FooterItem
                                href="/submissions"
                                icon={<ListIcon color="disabled" />}
                                label="Submissions"
                                type="internal"
                            />
                        )}
                    <FooterItem
                        href="/settings"
                        icon={<SettingsIcon color="disabled" />}
                        label="Settings"
                        type="internal"
                    />
                    <FooterItem
                        href={`${settings.serverUrl}/api-docs`}
                        icon={<CodeIcon color="disabled" />}
                        label="API"
                        type="external"
                    />

                    <FooterItem
                        href="https://github.com/Weebs-Incorporated/AIRAMI"
                        icon={<GitHubIcon color="disabled" />}
                        label="Source"
                        type="external"
                    />
                </Grid>
            </Paper>
        </>
    );
};

export default Footer;
