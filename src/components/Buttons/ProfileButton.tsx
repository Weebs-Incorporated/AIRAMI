import { Button, ButtonProps } from '@mui/material';
import { AIMS } from '../../types';
import { InternalLink } from '../Links';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ProfileButtonProps extends ButtonProps {
    user: AIMS.User;
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
