import { useCallback, useEffect, useState } from 'react';
import { IconButton } from '@mui/material';
import './SettingsCog.css';

import SettingsIcon from '@mui/icons-material/Settings';

const SettingsCog = () => {
    const [active, setActive] = useState(true);

    const [numClicks, setNumClicks] = useState(0);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            setActive(!active);
            setNumClicks(numClicks + 1);
        },
        [active, numClicks],
    );

    useEffect(() => {
        if (numClicks < 10) return;

        const timeout = setTimeout(() => {
            setNumClicks(0);
            setActive(true);
        }, 5_000);

        return () => {
            clearTimeout(timeout);
        };
    }, [numClicks]);

    return (
        <IconButton disableRipple onClick={handleClick}>
            <SettingsIcon className={`settingsCog ${active ? 'active' : ''} ${numClicks > 10 ? 'hyper' : ''}`} />
        </IconButton>
    );
};

export default SettingsCog;
