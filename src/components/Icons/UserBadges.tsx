import React, { ReactNode } from 'react';
import { Grid, GridProps, ListItemButton, ListItemIcon } from '@mui/material';
import { permissionsDisplayOrder, splitBitField } from '../../helpers';
import { ClientFacingUser, User, UserPermissions } from '../../types';

import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import CreateIcon from '@mui/icons-material/Create';

export interface UserBadgesProps extends GridProps {
    user: ClientFacingUser | User;
}

export const badgeIconMap: Record<UserPermissions, { label: string; title: string; icon: ReactNode }> = {
    [UserPermissions.AssignPermissions]: {
        label: 'Site Admin',
        icon: <SecurityIcon color="secondary" />,
        title: 'This user can change permissions.',
    },

    [UserPermissions.Audit]: {
        label: 'Post Auditor',
        icon: <GavelIcon color="info" />,
        title: 'This user reviews and moderates posts.',
    },
    [UserPermissions.None]: { label: '', icon: <></>, title: '' },
    [UserPermissions.Owner]: {
        label: 'Site Owner',
        icon: <StarIcon htmlColor="gold" />,
        title: 'This user owns the site.',
    },
    [UserPermissions.Upload]: {
        label: 'Uploader',
        icon: <CreateIcon color="success" />,
        title: 'This user can make post submissions to the site.',
    },
};

const NonMemoizedUserBadges = (props: UserBadgesProps) => {
    const { user, ...rest } = props;

    const badges = splitBitField(user.permissions)
        .sort((a, b) => permissionsDisplayOrder.indexOf(a) - permissionsDisplayOrder.indexOf(b))
        .map((permission) => {
            const { title, icon, label } = badgeIconMap[permission];
            return (
                <Grid item key={permission}>
                    <ListItemButton
                        title={title}
                        disableGutters
                        dense
                        sx={{ p: (t) => t.spacing(0.5, 1) }}
                        disableRipple
                    >
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
                </Grid>
            );
        });

    if (badges.length === 0) {
        badges.push(
            <Grid item key="_">
                &nbsp;
            </Grid>,
        );
    }

    return (
        <Grid container justifyContent="center" {...rest}>
            {badges}
        </Grid>
    );
};

export const UserBadges = React.memo(NonMemoizedUserBadges);
