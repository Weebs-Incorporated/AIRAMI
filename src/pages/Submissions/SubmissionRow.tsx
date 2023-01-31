import React, { useContext } from 'react';
import { CardActionArea, Grid, ImageListItem, ImageListItemBar, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ClientFacingUser, Post, PostStatus } from '../../types/AIMS';
import { SettingsContext } from '../../contexts';
import { InternalLink } from '../../components/Links';
import ProfilePicture from '../../components/ProfilePicture/ProfilePicture';

dayjs.extend(relativeTime);

export interface SubmissionRowProps {
    user: ClientFacingUser | string;
    submission: Post<PostStatus.InitialAwaitingValidation>;
}

const SubmissionRow = (props: SubmissionRowProps) => {
    const { settings } = useContext(SettingsContext);
    const { user, submission } = props;

    return (
        <CardActionArea>
            <InternalLink to={`/submissions/${submission._id}`}>
                <ImageListItem>
                    <img
                        src={`${settings.serverUrl}/images/${submission._id}`}
                        loading="lazy"
                        alt="submission"
                        height={submission.properties.dimensions.height}
                        width={submission.properties.dimensions.width}
                    />
                    <ImageListItemBar
                        title={submission._id}
                        subtitle={
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <ProfilePicture user={typeof user === 'string' ? null : user} size={24} />
                                    <span>{typeof user === 'string' ? user : <>{user.username}</>}</span>
                                </Stack>

                                <span
                                    style={{ color: '#cccccc' }}
                                    title={new Date(submission.properties.uploaded.at).toUTCString()}
                                >
                                    ({dayjs(submission.properties.uploaded.at).fromNow()})
                                </span>
                            </Stack>
                        }
                    >
                        <Grid container>
                            <Grid item xs={6}></Grid>
                            <Grid item xs={6}>
                                <Typography textAlign="right" color="gray">
                                    {dayjs(submission.properties.uploaded.at).fromNow()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </ImageListItemBar>
                </ImageListItem>
            </InternalLink>
        </CardActionArea>
    );
};

export default React.memo(SubmissionRow);
