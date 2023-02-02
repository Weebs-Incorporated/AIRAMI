import React from 'react';
import { Link, LinkProps, Typography } from '@mui/material';
import { ClientFacingUser, User } from '../../types';
import { InternalLink } from '../Links';
import ProfilePicture from '../ProfilePicture';

export interface InlineUserProps extends LinkProps {
    user: User | ClientFacingUser | string;
}

const InlineUser = ({ user, ...rest }: InlineUserProps) => (
    <InternalLink
        to={`/users/${typeof user === 'string' ? user : user._id}`}
        title={typeof user === 'string' ? 'User could not be found' : ''}
        style={{ display: 'inline-block' }}
    >
        <Typography style={{ display: 'flex', alignItems: 'center' }} whiteSpace="nowrap" component="span">
            <ProfilePicture user={typeof user === 'string' ? null : user} size={24} />
            &nbsp;
            <Link underline="hover" component="span" {...rest}>
                {typeof user === 'string' ? user : `${user.username}#${user.discriminator}`}
            </Link>
        </Typography>
    </InternalLink>
);

export default React.memo(InlineUser);
