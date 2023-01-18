import { useContext } from 'react';
import Button, { ButtonProps } from '@mui/material/Button';
import { SettingsContext } from '../../contexts';
import { ExternalLink } from '../Links';

import discordIcon from './discordIcon.svg';

export const LoginButton = (props?: ButtonProps) => {
    const { sessionData } = useContext(SettingsContext);

    return (
        <ExternalLink href={sessionData.oAuthLink} target="_self">
            <Button variant="outlined" startIcon={<img src={discordIcon} alt="Discord logo" />} {...props}>
                Login
            </Button>
        </ExternalLink>
    );
};
