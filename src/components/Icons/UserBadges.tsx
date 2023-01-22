import React, { ReactNode } from 'react';
import { Grid, GridProps, ListItemButton, ListItemIcon } from '@mui/material';
import { AIMS } from '../../types';
import { splitPermissionsField } from '../../helpers';

import StarIcon from '@mui/icons-material/Star';
import SecurityIcon from '@mui/icons-material/Security';
import GavelIcon from '@mui/icons-material/Gavel';
import CommentIcon from '@mui/icons-material/Comment';
import CreateIcon from '@mui/icons-material/Create';

export interface UserBadgesProps extends GridProps {
    user: AIMS.ClientFacingUser | AIMS.User;
    showAll?: boolean;
}

export const badgeIconMap: Record<AIMS.UserPermissions, { label: string; title: string; icon: ReactNode }> = {
    [AIMS.UserPermissions.AssignPermissions]: {
        label: 'Site Admin',
        icon: <SecurityIcon color="secondary" />,
        title: 'This user can change permissions.',
    },

    [AIMS.UserPermissions.Audit]: {
        label: 'Post Auditor',
        icon: <GavelIcon color="info" />,
        title: 'This user reviews and moderates posts.',
    },
    [AIMS.UserPermissions.Comment]: {
        label: 'Comment',
        icon: <CommentIcon color="primary" />,
        title: 'This user can make new comments.',
    },
    [AIMS.UserPermissions.None]: { label: '', icon: <></>, title: '' },
    [AIMS.UserPermissions.Owner]: {
        label: 'Site Owner',
        icon: <StarIcon htmlColor="gold" />,
        title: 'This user owns the site.',
    },
    [AIMS.UserPermissions.Upload]: {
        label: 'Upload',
        icon: <CreateIcon color="success" />,
        title: 'This user can make post submissions to the site.',
    },
};

const relevantPermissions = new Set<AIMS.UserPermissions>([
    AIMS.UserPermissions.Owner,
    AIMS.UserPermissions.AssignPermissions,
    AIMS.UserPermissions.Audit,
]);

const NonMemoizedUserBadges = (props: UserBadgesProps) => {
    const { user, showAll, ...rest } = props;

    let permissions = splitPermissionsField(user.permissions);

    if (!showAll) permissions = permissions.filter((e) => relevantPermissions.has(e));

    const badges = permissions.map((permission) => {
        const { title, icon, label } = badgeIconMap[permission];
        return (
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
