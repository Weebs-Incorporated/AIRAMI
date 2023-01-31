import { Button, ButtonProps } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { InternalLink } from '../Links';

export const HomeButton = (props?: ButtonProps) => (
    <InternalLink to="/">
        <Button variant="outlined" color="secondary" size="large" startIcon={<HomeIcon />} {...props}>
            Home
        </Button>
    </InternalLink>
);
