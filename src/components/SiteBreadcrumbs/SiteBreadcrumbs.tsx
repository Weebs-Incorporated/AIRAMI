import { Breadcrumbs, Link, BreadcrumbsProps } from '@mui/material';
import { InternalLink } from '../Links';

export interface SiteBreadcrumbsProps extends BreadcrumbsProps {
    items: { to: string; text: string }[];
}

const SiteBreadcrumbs = (props: SiteBreadcrumbsProps) => {
    const { items, ...rest } = props;
    return (
        <Breadcrumbs {...rest} sx={{ alignSelf: 'flex-start', mt: 2, ml: 2, ...rest.sx }} aria-label="breadcrumb">
            {items.map(({ to, text }) => (
                <InternalLink key={text} to={to}>
                    <Link underline="hover" color="inherit" component="span">
                        {text}
                    </Link>
                </InternalLink>
            ))}
        </Breadcrumbs>
    );
};

export default SiteBreadcrumbs;
