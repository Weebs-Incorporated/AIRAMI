import { ReactNode } from 'react';

export interface ExternalLinkProps {
    href: string;
    target?: React.HTMLAttributeAnchorTarget;
    children: ReactNode;
}

export const ExternalLink = (props: ExternalLinkProps) => {
    const { href, target, children } = props;

    return (
        <a
            href={href}
            rel="noopener noreferrer"
            target={target ?? '_blank'}
            style={{ color: 'inherit', textDecoration: 'inherit' }}
        >
            {children}
        </a>
    );
};
