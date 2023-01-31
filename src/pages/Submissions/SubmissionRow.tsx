import React, { useContext } from 'react';
import { Card, CardActionArea, CardContent, CardMedia, Grid, Link, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ClientFacingUser, Post, PostStatus } from '../../types/AIMS';
import { SettingsContext } from '../../contexts';
import { InternalLink } from '../../components/Links';
import DimensionsLabel from '../../components/DimensionsLabel';
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
        <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card>
                <CardActionArea>
                    <div style={{ position: 'relative' }}>
                        <CardMedia
                            component="img"
                            loading="lazy"
                            alt="submission"
                            image={`${settings.serverUrl}/images/${submission._id}`}
                        />
                        <Typography>
                            <DimensionsLabel dimensions={submission.properties.dimensions} />
                        </Typography>
                    </div>
                    <CardContent>
                        <InternalLink to={`/users/${typeof user === 'string' ? user : user._id}`}>
                            <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                                <ProfilePicture user={typeof user === 'string' ? null : user} size={24} />
                                &nbsp;
                                <Link underline="hover" component="span">
                                    {typeof user === 'string' ? (
                                        user
                                    ) : (
                                        <>
                                            {user.username}#{user.discriminator}
                                        </>
                                    )}
                                </Link>
                            </Typography>
                        </InternalLink>
                        <Grid container title={new Date(submission.properties.uploaded.at).toUTCString()}>
                            <Grid item xs={6}>
                                {new Date(submission.properties.uploaded.at).toLocaleDateString('en-NZ')}
                            </Grid>
                            <Grid item xs={6}>
                                <Typography textAlign="right" color="gray">
                                    {dayjs(submission.properties.uploaded.at).fromNow()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </CardActionArea>
            </Card>
            {/*             <Paper sx={{ p: 1, height: '100%' }}>
                <Stack sx={{ height: '100%' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <img
                            src={makeImageUrl(submission.url, settings.serverUrl)}
                            alt="submission"
                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                            loading="lazy"
                        />
                    </div>

                </Stack>
            </Paper> */}
        </Grid>
    );
};

export default React.memo(SubmissionRow);
