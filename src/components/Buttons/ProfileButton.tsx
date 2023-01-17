import React from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { AIMS } from '../../types';
import { InternalLink } from '../Links';
import Avatar from '@mui/material/Avatar';

export interface ProfileButtonProps extends ButtonProps {
    user: AIMS.User;
}

const ProfileButton = (props: ProfileButtonProps) => {
    const { user, ...rest } = props;
    return (
        <InternalLink to="/me">
            <Button
                variant="outlined"
                {...rest}
                startIcon={
                    <Avatar
                        src={`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png`}
                        alt="Your Discord profile"
                    />
                }
            >
                Profile
            </Button>
        </InternalLink>
    );
};

export default ProfileButton;
