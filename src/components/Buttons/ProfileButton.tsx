import { Avatar, Button, ButtonProps } from '@mui/material';
import { AIMS } from '../../types';
import { InternalLink } from '../Links';

export interface ProfileButtonProps extends ButtonProps {
    user: AIMS.User;
}

export const ProfileButton = (props: ProfileButtonProps) => {
    const { user, ...rest } = props;
    return (
        <InternalLink to="/me">
            <Button
                variant="outlined"
                startIcon={
                    <Avatar
                        src={`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png`}
                        alt="Your Discord profile"
                    />
                }
                {...rest}
            >
                Profile
            </Button>
        </InternalLink>
    );
};
