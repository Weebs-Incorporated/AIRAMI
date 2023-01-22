import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Checkbox,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    ListItemButton,
    Typography,
} from '@mui/material';
import { SettingsContext, UserSession } from '../../contexts';
import { AIMS } from '../../types';
import { hasPermission, permissionDescriptionsMap } from '../../helpers';
import { aims } from '../../api';

import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export interface PermissionEditorProps {
    targetUser: AIMS.ClientFacingUser;
    loggedInUser: UserSession;
    onClose: () => void;
    open: boolean;
    onPermissionsUpdate: (newPermissions: AIMS.UserPermissions) => void;
}

const relevantPermissions: AIMS.UserPermissions[] = [
    AIMS.UserPermissions.AssignPermissions,
    AIMS.UserPermissions.Audit,
    AIMS.UserPermissions.Upload,
];

const PermissionEditor = (props: PermissionEditorProps) => {
    const { targetUser, loggedInUser, onClose, open, onPermissionsUpdate } = props;

    const { settings } = useContext(SettingsContext);

    const [newPermissions, setNewPermissions] = useState(targetUser.permissions);

    const [isSaving, setIsSaving] = useState(false);

    const [saveOutput, setSaveOutput] = useState<[string, 'success' | 'fail']>(['', 'success']);

    const hasChanged = useMemo(
        () => targetUser.permissions !== newPermissions,
        [newPermissions, targetUser.permissions],
    );

    useEffect(() => setSaveOutput(['', 'success']), [newPermissions]);

    const handleCheck = useCallback(
        (permission: AIMS.UserPermissions) => (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isSaving) return;
            if (e.target.checked) setNewPermissions(newPermissions | permission);
            else setNewPermissions(newPermissions ^ permission);
        },
        [isSaving, newPermissions],
    );

    const handleSave = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            if (newPermissions === targetUser.permissions) return;

            setIsSaving(true);
            aims.patchUser(
                {
                    baseURL: settings.serverUrl,
                    siteToken: loggedInUser.siteToken,
                    rateLimitBypassToken: settings.rateLimitBypassToken,
                },
                targetUser._id,
                newPermissions,
            ).then((res) => {
                if (res === 'aborted') {
                    setSaveOutput(['Permission change was aborted', 'fail']);
                } else if (res.success) {
                    targetUser.permissions = newPermissions;
                    if (res.status === 200) {
                        setSaveOutput(['Permissions updated.', 'success']);
                    } else {
                        setSaveOutput(['Permissions were already this.', 'success']);
                    }
                    onPermissionsUpdate(newPermissions);
                } else if (res.generic) {
                    setSaveOutput([`Error ${res.status}${res.statusText !== '' ? `: ${res.statusText}` : ''}`, 'fail']);
                } else {
                    switch (res.status) {
                        case 401:
                            setSaveOutput(['Invalid credentials, logging out is recommended.', 'fail']);
                            break;
                        case 403:
                            setSaveOutput([res.data, 'fail']);
                            break;
                        case 404:
                            setSaveOutput(['User not found.', 'fail']);
                            break;
                        case 429:
                            setSaveOutput([`Rate limited, try again in ${res.data.reset} seconds.`, 'fail']);
                            break;
                        case 501:
                            setSaveOutput(['User database not enabled.', 'fail']);
                            break;
                        default:
                            throw res;
                    }
                }
                setIsSaving(false);
            });
        },
        [
            loggedInUser.siteToken,
            newPermissions,
            onPermissionsUpdate,
            settings.rateLimitBypassToken,
            settings.serverUrl,
            targetUser,
        ],
    );

    return (
        <Dialog maxWidth="md" open={isSaving || open} onClose={onClose}>
            <DialogTitle textAlign="center">{targetUser.username}'s Permissions</DialogTitle>
            <DialogContent>
                <Grid container>
                    {relevantPermissions.map((permission) => {
                        return (
                            <Grid item xs={12} sm={6} key={permission}>
                                <FormControl>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={hasPermission(newPermissions, permission)}
                                                onChange={handleCheck(permission)}
                                            />
                                        }
                                        componentsProps={{ typography: { width: '100%' } }}
                                        label={<ListItemButton>{AIMS.UserPermissions[permission]}</ListItemButton>}
                                    />
                                    <FormLabel>
                                        <Typography color="gray">{permissionDescriptionsMap[permission]}</Typography>
                                    </FormLabel>
                                </FormControl>
                            </Grid>
                        );
                    })}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={1} justifyContent="flex-end">
                    <Grid item xs={12} sm={'auto'}>
                        <Button
                            variant="outlined"
                            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                            disabled={!hasChanged || isSaving}
                            onClick={handleSave}
                            sx={{ width: '100%' }}
                        >
                            Save
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={'auto'}>
                        <Button
                            variant="outlined"
                            startIcon={<RestartAltIcon />}
                            disabled={!hasChanged || isSaving}
                            onClick={(e) => {
                                e.preventDefault();
                                setNewPermissions(targetUser.permissions);
                            }}
                            sx={{ width: '100%' }}
                        >
                            Reset
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={'auto'}>
                        <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            disabled={isSaving}
                            onClick={(e) => {
                                e.preventDefault();
                                onClose();
                            }}
                            sx={{ width: '100%' }}
                        >
                            Close
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
            <Collapse in={saveOutput[0] !== ''}>
                <DialogContent>
                    <DialogContentText
                        textAlign="center"
                        color={saveOutput[1] === 'success' ? 'lightgreen' : 'lightcoral'}
                    >
                        {saveOutput[0]}
                    </DialogContentText>
                </DialogContent>
            </Collapse>
        </Dialog>
    );
};

export default PermissionEditor;
