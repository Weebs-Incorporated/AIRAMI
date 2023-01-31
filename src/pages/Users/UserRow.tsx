import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TableRow, TableCell, Typography, Button, Link } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { UserBadges } from '../../components/Icons';
import PermissionEditor from '../../components/PermissionEditor/PermissionEditor';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';
import { UserSession } from '../../contexts';
import { hasPermission } from '../../helpers';
import { InternalLink } from '../../components/Links';
import { ClientFacingUser, UserPermissions } from '../../types';

dayjs.extend(relativeTime);

export interface UserRowProps {
    user: ClientFacingUser;
    showIp: boolean;
    loggedInUser: UserSession;
    onPermissionUpdate: (newPermissions: UserPermissions, isSelf: boolean) => void;
}

const UserRow = (props: UserRowProps) => {
    const { user, showIp, loggedInUser, onPermissionUpdate } = props;

    const [permissionElementOpen, setPermissionElementOpen] = useState(false);

    const isSelf = useMemo(() => user._id === loggedInUser.userData._id, [loggedInUser.userData._id, user._id]);

    const permissionElement = useMemo(() => {
        if (
            !hasPermission(loggedInUser.userData, UserPermissions.Owner) &&
            hasPermission(user, UserPermissions.Owner)
        ) {
            return <></>;
        }

        return (
            <>
                <Button
                    variant="outlined"
                    color="info"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                        e.preventDefault();
                        setPermissionElementOpen(true);
                    }}
                    size="small"
                >
                    Edit
                </Button>
                <PermissionEditor
                    loggedInUser={loggedInUser}
                    open={permissionElementOpen}
                    onClose={() => {
                        setPermissionElementOpen(false);
                    }}
                    onPermissionsUpdate={(newPermissions) => onPermissionUpdate(newPermissions, isSelf)}
                    targetUser={user}
                />
            </>
        );
    }, [isSelf, loggedInUser, onPermissionUpdate, permissionElementOpen, user]);

    return (
        <TableRow hover>
            <TableCell>
                <InternalLink to={`/users/${user._id}`}>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <ProfilePicture user={user} size={24} />
                        &nbsp;
                        <Link underline="hover" component="span">
                            {user.username}#{user.discriminator}
                        </Link>
                    </Typography>
                </InternalLink>
            </TableCell>
            <TableCell>{user.posts}</TableCell>
            {showIp && <TableCell>{user.latestIp}</TableCell>}
            <TableCell>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <UserBadges user={user} justifyContent="flex-start" />
                    {permissionElement}
                </div>
            </TableCell>
            <TableCell title={new Date(user.registered).toUTCString()}>
                <Typography>
                    {new Date(user.registered).toLocaleDateString('en-NZ')}
                    <br />
                    <span style={{ color: 'gray' }}>{dayjs(user.registered).fromNow()}</span>
                </Typography>
            </TableCell>
            <TableCell title={new Date(user.lastLoginOrRefresh).toUTCString()}>
                <Typography>
                    {new Date(user.lastLoginOrRefresh).toLocaleDateString('en-NZ')}
                    <br />
                    <span style={{ color: 'gray' }}>{dayjs(user.lastLoginOrRefresh).fromNow()}</span>
                </Typography>
            </TableCell>
        </TableRow>
    );
};

export default UserRow;
