import { Link, LinkProps } from 'react-router-dom';

const InternalLink = (props: LinkProps) => {
    return <Link {...props} style={{ color: 'inherit', textDecoration: 'inherit', margin: 0 }} />;
};

export default InternalLink;
