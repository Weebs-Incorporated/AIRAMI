import { ReactNode } from 'react';

export interface ExternalLinkProps {
    href: string;
    target?: React.HTMLAttributeAnchorTarget;
    children: ReactNode;
    style?: React.CSSProperties;
}

export const ExternalLink = (props: ExternalLinkProps) => {
    const { href, target, children, style } = props;

    return (
        <a
            href={href}
            rel="noopener noreferrer"
            target={target ?? '_blank'}
            style={{ color: 'inherit', textDecoration: 'inherit', ...style }}
        >
            {children}
        </a>
    );
};
