import { Container, ImageList, ImageListItem, Link, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { aims } from '../../api';
import Footer from '../../components/Footer';
import { InternalLink } from '../../components/Links';
import { SettingsContext } from '../../contexts';
import { Post, PostStatus } from '../../types';

const HomePage = () => {
    const { settings } = useContext(SettingsContext);

    const [images, setImages] = useState<Post<PostStatus.Public>[]>([]);

    useEffect(() => {
        const controller = new AbortController();

        aims.getRandomPosts(
            {
                baseURL: settings.serverUrl,
                siteToken: undefined,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            10,
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) setImages(res.data);
            else console.log(res);
        });
    }, [settings.rateLimitBypassToken, settings.serverUrl]);

    return (
        <>
            <div style={{ flexGrow: 1 }} />
            <Typography variant="h1">AIRAMI</Typography>
            <Typography variant="subtitle2" color="gray" sx={{ pl: 1, pr: 1, mb: 3 }} textAlign="center">
                Anime Image Retrieval And Modification Interface
            </Typography>
            <InternalLink to="/users/240312568273436674">
                <Link underline="hover" component="span">
                    Go to a cool person's profile
                </Link>
            </InternalLink>
            {!!images.length && (
                <Container maxWidth="lg">
                    <ImageList variant="masonry" cols={3} gap={8}>
                        {images.map((e) => (
                            <ImageListItem key={e._id}>
                                <img
                                    src={`${settings.serverUrl}/images/${e._id}`}
                                    alt={`post ${e._id}`}
                                    loading="lazy"
                                    height={e.properties.dimensions.height}
                                    width={e.properties.dimensions.width}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Container>
            )}
            <Footer />
        </>
    );
};

export default HomePage;
