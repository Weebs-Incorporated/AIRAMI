import { ReactNode } from 'react';
import { Grid, Link } from '@mui/material';
import { ExternalLink, InternalLink } from '../Links';

export interface FooterItemProps {
    href: string;
    icon: ReactNode;
    label: string;
    type: 'external' | 'internal';
}

const FooterItem = ({ href, icon, label, type }: FooterItemProps) => (
    <Grid item xs={6} sm={3} md={2}>
        {type === 'external' ? (
            <ExternalLink
                href={href}
                style={{ display: 'flex', flexFlow: 'row', alignItems: 'center', justifyContent: 'center' }}
            >
                {icon}&nbsp;
                <Link underline="hover" color="gray" component="span">
                    {label}
                </Link>
            </ExternalLink>
        ) : (
            <InternalLink
                to={href}
                style={{ display: 'flex', flexFlow: 'row', alignItems: 'center', justifyContent: 'center' }}
            >
                {icon}&nbsp;
                <Link underline="hover" color="gray" component="span">
                    {label}
                </Link>
            </InternalLink>
        )}
    </Grid>
);

export default FooterItem;
