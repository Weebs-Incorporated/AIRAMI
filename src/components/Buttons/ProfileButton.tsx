import { Button, ButtonProps } from '@mui/material';
import { User } from '../../types';
import { InternalLink } from '../Links';
import ProfilePicture from '../ProfilePicture';

export interface ProfileButtonProps extends ButtonProps {
    user: User;
}

export const ProfileButton = (props: ProfileButtonProps) => {
    const { user, ...rest } = props;
    return (
        <InternalLink to="/me">
            <Button variant="outlined" startIcon={<ProfilePicture user={user} />} {...rest}>
                Profile
            </Button>
        </InternalLink>
    );
};
