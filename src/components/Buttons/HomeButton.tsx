import { Button, ButtonProps } from '@mui/material';
import { InternalLink } from '../Links';
import HomeIcon from '@mui/icons-material/Home';

export const HomeButton = (props?: ButtonProps) => (
    <InternalLink to="/">
        <Button variant="outlined" color="secondary" size="large" startIcon={<HomeIcon />} {...props}>
            Home
        </Button>
    </InternalLink>
);
