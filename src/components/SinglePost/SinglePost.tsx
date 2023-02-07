import { Collapse, Typography } from '@mui/material';
import { useRelatedUsers } from '../../hooks';
import { Post, PostStatus } from '../../types';
import Attributes from './Attributes';
import Properties from './Properties';

export interface SinglePostProps<T extends PostStatus> {
    post: Post<T>;
    onUpdate: (newPost: Post<T>) => void;
}

const SinglePost = <T extends PostStatus>(props: SinglePostProps<T>) => {
    const { post, onUpdate } = props;

    const { error, uploader, approver, withdrawer, lastModifier } = useRelatedUsers(post);

    return (
        <>
            <Collapse in={!!error}>
                <Typography color="lightcoral" gutterBottom variant="h5">
                    User Fetching Failed - {error}
                </Typography>
            </Collapse>
            <Properties
                id={post._id}
                properties={post.properties}
                uploader={uploader}
                approver={approver}
                withdrawer={withdrawer}
                lastModifier={lastModifier}
                onStatusUpdate={(newStatus) => {
                    const newPost = { ...post, properties: { ...post.properties, status: newStatus } };
                    onUpdate(newPost as Post<T>);
                }}
            />
            <Typography variant="h3" gutterBottom textAlign="center">
                Attributes
            </Typography>
            <Attributes
                id={post._id}
                postType={post.properties.status}
                attributes={post.attributes}
                onUpdate={onUpdate}
            />
        </>
    );
};

export default SinglePost;
