import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    LinearProgress,
    TextField,
    Typography,
} from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SettingsContext, UserSession } from '../../contexts';

import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { aims } from '../../api';
import { messages } from '../../constants';

export interface SubmissionCreatorProps {
    open: boolean;
    onClose: () => void;
    loggedInUser: UserSession;
}

const fileNameValidator = new RegExp(/^[a-z0-9-_]{1,}.(png|jpe?g)$/);

const SubmissionCreator = (props: SubmissionCreatorProps) => {
    const { open, onClose, loggedInUser } = props;

    const { settings } = useContext(SettingsContext);

    const inputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [file, setFile] = useState<File>();
    const [fileName, setFileName] = useState<string>('');

    const [preview, setPreview] = useState<string>();
    const [fileData, setFileData] = useState<[Uint8Array, string]>();

    const fileNameHint = useMemo(() => {
        if (fileName === '') return 'Submission Name';
        if (fileNameValidator.test(fileName)) return 'Valid Name';
        return 'Invalid Name';
    }, [fileName]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => setError(''), [file, fileName]);

    const resetAll = useCallback(() => {
        setFile(undefined);
        setFileName('');
        setPreview(undefined);
    }, []);

    const onCloseWrapper = useCallback(() => {
        if (isSubmitting) return;
        if (inputRef.current !== null) inputRef.current.value = '';
        resetAll();
        onClose();
    }, [isSubmitting, onClose, resetAll]);

    const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.item(0);
        if (!file) return;

        setFile(file);
        setFileName(file.name.toLowerCase() ?? '');
    }, []);

    // generating preview
    useEffect(() => {
        if (file === undefined) return;
        setPreview(undefined);

        const reader = new FileReader();

        reader.onload = (e) => {
            setPreview(e.target?.result as string);
        };

        reader.readAsDataURL(file);
    }, [file]);

    // generating data
    useEffect(() => {
        if (file === undefined) return;

        file.arrayBuffer()
            .then((e) => {
                setFileData([new Uint8Array(e), file.type]);
            })
            .catch((e) => {
                console.error(e);
                setError('Failed to Read File');
            });
    }, [file]);

    useEffect(() => {
        if (!isSubmitting || success || fileData === undefined) return;

        setError('');

        const controller = new AbortController();

        aims.makeSubmission(
            {
                baseURL: settings.serverUrl,
                siteToken: loggedInUser.siteToken,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            fileName,
            fileData[0],
            fileData[1],
        )
            .then((res) => {
                if (res === 'aborted') return;
                if (res.success) setSuccess(true);
                else if (res.generic) setError(messages.genericFail(res));
                else if (res.status === 401) setError(messages[401](res.data));
                else if (res.status === 403) setError(messages[403]());
                else if (res.status === 409) setError('Duplicate Name');
                else if (res.status === 415) setError('Invalid File Type');
                else if (res.status === 429) setError(messages[429](res.data));
                else if (res.status === 501) setError(messages[501]);
                else throw res;
            })
            .finally(() => {
                setIsSubmitting(false);
            });

        return () => {
            controller.abort();
        };
    }, [
        fileData,
        fileName,
        isSubmitting,
        loggedInUser.siteToken,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        success,
    ]);

    useEffect(() => {
        if (!success) return;

        const timeout = setTimeout(() => setSuccess(false), 3000);

        return () => {
            clearTimeout(timeout);
        };
    }, [success]);

    return (
        <Dialog maxWidth="sm" open={isSubmitting || open} onClose={onCloseWrapper}>
            <DialogTitle textAlign="center">New Submission</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            name="fileUpload"
                            style={{ width: '100%' }}
                            onChange={handleFile}
                            ref={inputRef}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Collapse in={!!file}>
                            <TextField
                                fullWidth
                                label={fileNameHint}
                                InputLabelProps={{ shrink: true }}
                                variant="filled"
                                value={fileName}
                                onChange={(e) => {
                                    e.preventDefault();
                                    setFileName(e.target.value);
                                }}
                                color={
                                    fileNameHint === 'Invalid Name'
                                        ? 'error'
                                        : fileNameHint === 'Valid Name'
                                        ? 'success'
                                        : 'primary'
                                }
                                error={fileNameHint === 'Invalid Name'}
                                name="fileUploadName"
                            />
                        </Collapse>
                    </Grid>
                    {preview !== undefined && (
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <img
                                src={preview}
                                alt="submission preview"
                                style={{ maxWidth: '100%', maxHeight: '100%' }}
                            />
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Collapse in={!isSubmitting}>
                            <Button
                                variant="contained"
                                fullWidth
                                color="success"
                                size="large"
                                startIcon={<SendIcon />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setIsSubmitting(true);
                                }}
                                disabled={!file || isSubmitting || fileNameHint !== 'Valid Name'}
                            >
                                Submit
                            </Button>
                        </Collapse>
                    </Grid>
                    <Grid item xs={6}>
                        <Collapse in={!isSubmitting}>
                            <Button
                                variant="contained"
                                fullWidth
                                color="error"
                                size="large"
                                startIcon={<DeleteIcon />}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onCloseWrapper();
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </Collapse>
                    </Grid>
                    <Grid item xs={12}>
                        <Collapse in={isSubmitting}>
                            <Typography variant="h5" textAlign="center" gutterBottom>
                                Submitting...
                            </Typography>
                            <LinearProgress />
                        </Collapse>
                        <Collapse in={error !== ''}>
                            <Typography variant="h5" textAlign="center" color="lightcoral">
                                {error}
                            </Typography>
                        </Collapse>
                        <Collapse in={success}>
                            <Typography variant="h5" textAlign="center" color="lightgreen">
                                Submitted!
                            </Typography>
                        </Collapse>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

export default SubmissionCreator;
