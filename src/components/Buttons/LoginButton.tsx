import React, { useContext } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { SettingsContext } from '../../contexts';
import { ExternalLink } from '../Links';

const LoginButton = (props?: ButtonProps) => {
    const { sessionData } = useContext(SettingsContext);

    return (
        <ExternalLink href={sessionData.oAuthLink} target="_self">
            <Button variant="outlined" {...props}>
                Login
            </Button>
        </ExternalLink>
    );
};

export default LoginButton;
