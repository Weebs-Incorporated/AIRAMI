import React from 'react';
import Fade from '@mui/material/Fade';
import TextField, { BaseTextFieldProps } from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';

import ResetToDefaultIcon from '@mui/icons-material/RestartAlt';
import TestValueIcon from '@mui/icons-material/CheckCircleOutline';
import TestSuccessIcon from '@mui/icons-material/CheckCircle';
import TestFailIcon from '@mui/icons-material/Cancel';
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';

export type SettingsItemTestState = 'available' | 'inProgress' | 'success' | 'fail';

export interface SettingsItemTest {
    state: SettingsItemTestState;
    handleClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title: { [k in SettingsItemTestState]: string };
}

export interface SettingsItemProps {
    label: string;
    value: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleReset: (e: React.MouseEvent<HTMLButtonElement>) => void;
    title: string;
    isDefault: boolean;
    inputMode?: React.HTMLAttributes<HTMLInputElement | HTMLTextAreaElement>['inputMode'];
    test?: SettingsItemTest;
    hide?: { hidden: boolean; setHidden: (newHidden: boolean) => void };
}

const NonMemoizedSettingsItem = (props: SettingsItemProps) => {
    const { label, value, handleChange, handleReset, title, isDefault, inputMode, test, hide } = props;

    let color: Exclude<BaseTextFieldProps['color'], undefined>;

    if (test === undefined) {
        color = 'secondary';
    } else {
        switch (test.state) {
            case 'success':
                color = 'success';
                break;
            case 'fail':
                color = 'error';
                break;
            case 'inProgress':
                color = 'info';
                break;
            case 'available':
                color = 'secondary';
                break;
        }
    }

    return (
        <Grid item xs={12} md={6} sx={{ width: '100%' }}>
            <TextField
                color={color}
                error={color === 'error'}
                variant="outlined"
                label={label}
                value={value}
                onChange={handleChange}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <Fade in={!isDefault}>
                                <IconButton title="Reset to default" onClick={handleReset}>
                                    <ResetToDefaultIcon color="warning" />
                                </IconButton>
                            </Fade>
                            {test !== undefined && (
                                <Fade in={value !== ''}>
                                    <IconButton title={test.title[test.state]} onClick={test.handleClick}>
                                        {test.state === 'success' ? (
                                            <TestSuccessIcon color={color} />
                                        ) : test.state === 'available' ? (
                                            <TestValueIcon color={color} />
                                        ) : test.state === 'fail' ? (
                                            <TestFailIcon color={color} />
                                        ) : (
                                            <CircularProgress size={20} color={color} />
                                        )}
                                    </IconButton>
                                </Fade>
                            )}
                            {hide !== undefined && (
                                <IconButton
                                    onClick={(e) => {
                                        e.preventDefault();
                                        hide.setHidden(!hide.hidden);
                                    }}
                                    title={hide.hidden ? 'Show' : 'Hide'}
                                >
                                    {hide.hidden ? <ShowPasswordIcon /> : <HidePasswordIcon />}
                                </IconButton>
                            )}
                        </InputAdornment>
                    ),
                }}
                inputProps={{ inputMode }}
                InputLabelProps={{ shrink: true }}
                fullWidth
                type={hide?.hidden === true ? 'password' : 'text'}
            />
            <Typography variant="body2" color="gray" sx={{ ml: 1 }}>
                {title}
            </Typography>
            {test !== undefined ? (
                <Fade in={test.state !== 'available'}>
                    <Typography variant="body2" color="gray" sx={{ ml: 1 }}>
                        {test.title[test.state]}
                    </Typography>
                </Fade>
            ) : (
                <br />
            )}
        </Grid>
    );
};

const SettingsItem = React.memo(NonMemoizedSettingsItem);

export default SettingsItem;
