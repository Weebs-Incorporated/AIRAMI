import { PostAttributes } from './Attributes';
import { PostStatus } from './PostStatus';
import { PostProperties } from './Properties';

export interface Post<T extends PostStatus> {
    /** Normally the uploaded file name. */
    _id: string;

    properties: PostProperties<T>;
    attributes: PostAttributes;
}
