import { Link, LinkProps } from 'react-router-dom';

export const InternalLink = (props: LinkProps) => (
    <Link {...props} style={{ color: 'inherit', textDecoration: 'inherit', ...props.style }} />
);
