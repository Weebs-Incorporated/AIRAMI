import { useContext } from 'react';
import { Grid, Paper, PaperProps, Avatar } from '@mui/material';
import { SettingsContext, UserSessionContext } from '../../contexts';
import FooterItem from './FooterItem';

import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';

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
                            href="/me"
                            icon={
                                <Avatar
                                    src={`https://cdn.discordapp.com/avatars/${user.userData._id}/${user.userData.avatar}.png`}
                                    alt="Your Discord profile"
                                    sx={{ width: '24px', height: '24px' }}
                                />
                            }
                            label="Profile"
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
