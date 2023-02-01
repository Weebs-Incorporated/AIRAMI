import React from 'react';
import { Link, LinkProps, Tooltip, Typography } from '@mui/material';
import { ClientFacingUser, User } from '../../types';
import { InternalLink } from '../Links';
import ProfilePicture from '../ProfilePicture';

export interface InlineUserProps extends LinkProps {
    user: User | ClientFacingUser | string;
}

const InlineUser = ({ user, ...rest }: InlineUserProps) => (
    <Tooltip title={typeof user === 'string' || !!true ? 'User could not be found' : ''}>
        <InternalLink to={`/users/${typeof user === 'string' ? user : user._id}`}>
            <Typography style={{ display: 'flex', alignItems: 'center' }}>
                <ProfilePicture user={typeof user === 'string' ? null : user} size={24} />
                &nbsp;
                <Link underline="hover" component="span" {...rest}>
                    {typeof user === 'string' ? user : `${user.username}#${user.discriminator}`}
                </Link>
            </Typography>
        </InternalLink>
    </Tooltip>
);

export default React.memo(InlineUser);
