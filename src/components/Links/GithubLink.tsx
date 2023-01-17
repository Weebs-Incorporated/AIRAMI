import GitHubIcon from '@mui/icons-material/GitHub';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ExternalLink from './ExternalLink';

export interface GithubLinkProps extends Omit<IconButtonProps, 'size'> {
    size?: number;
}

const GithubLink = (props: GithubLinkProps) => {
    const { size, ...rest } = props;

    return (
        <ExternalLink href="https://github.com/Weebs-Incorporated/AIRAMI">
            <IconButton title="View source code" {...rest}>
                <GitHubIcon color="disabled" sx={{ fontSize: `${size ?? 60}px` }} />
            </IconButton>
        </ExternalLink>
    );
};

export default GithubLink;
