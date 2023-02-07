import { useContext, useMemo } from 'react';
import { Button, Slide } from '@mui/material';
import { UserSessionContext } from '../../../contexts';
import { hasOneOfPermissions } from '../../../helpers';
import { UserPermissions } from '../../../types';

export interface WithdrawProps {
    postId: string;
    onWithdraw: () => void;
    slideIn: boolean;
}

const Withdraw = ({ postId, onWithdraw, slideIn }: WithdrawProps) => {
    const { user } = useContext(UserSessionContext);

    const canEdit = useMemo(
        () =>
            !!user?.userData.permissions &&
            hasOneOfPermissions(
                user.userData.permissions,
                UserPermissions.Audit,
                UserPermissions.AssignPermissions,
                UserPermissions.Owner,
            ),
        [user?.userData.permissions],
    );

    if (!canEdit) return <></>;

    return (
        <Slide in={slideIn} direction="right">
            <Button
                variant="contained"
                fullWidth
                color="success"
                size="large"
                sx={{ mt: 2 }}
                onClick={() => window.alert('Coming Soon')}
            >
                Withdraw
            </Button>
        </Slide>
    );
};

export default Withdraw;
