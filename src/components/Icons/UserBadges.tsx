import { Grid, GridProps, ListItemButton, ListItemIcon } from '@mui/material';
import { AIMS } from '../../types';
import { hasPermission } from '../../helpers';
import { ReactNode } from 'react';
import { UserPermissions } from '../../types/AIMS';

import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';

export interface UserBadgesProps extends GridProps {
    user: AIMS.ClientFacingUser | AIMS.User;
}

const badgeIconMap: Map<UserPermissions, { label: string; title: string; icon: ReactNode }> = new Map([
    [
        UserPermissions.Owner,
        { label: 'Site Owner', icon: <StarIcon htmlColor="gold" />, title: 'This user owns the site.' },
    ],
    [
        UserPermissions.AssignPermissions,
        { label: 'Site Admin', icon: <SecurityIcon color="secondary" />, title: 'This user can change permissions.' },
    ],
    [
        UserPermissions.Audit,
        { label: 'Post Auditor', icon: <GavelIcon color="info" />, title: 'This user reviews and moderates posts.' },
    ],
]);

export const UserBadges = (props: UserBadgesProps) => {
    const { user, ...rest } = props;

    const badges: ReactNode[] = [];

    badgeIconMap.forEach(({ title, icon, label }, permission) => {
        if (!hasPermission(user, permission)) return;

        badges.push(
            <Grid item key={permission}>
                <ListItemButton title={title} disableGutters dense sx={{ p: (t) => t.spacing(0.5, 1) }} disableRipple>
                    <ListItemIcon sx={{ minWidth: 'unset', pr: 0.5 }}>{icon}</ListItemIcon>
                    <span
                        style={{
                            color: 'gray',
                            fontSize: '12px',
                        }}
                    >
                        {label}
                    </span>
                </ListItemButton>
            </Grid>,
        );
    });

    if (badges.length === 0)
        badges.push(
            <Grid item key="_">
                &nbsp;
            </Grid>,
        );

    return (
        <Grid container justifyContent="center" {...rest}>
            {badges}
        </Grid>
    );
};
