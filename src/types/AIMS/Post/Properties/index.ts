import { PostStatus } from '../PostStatus';
import { PostActionBlame } from './PostActionBlame';

/**
 * Post properties are the aspects of a post that do not pertain to image contents.
 *
 * These aspects are automatically generated, and the creator/editor of a post has no control over them.
 *
 * For aspects relating to image content, see PostAttributes.
 */
export interface PostProperties<T extends PostStatus> {
    /** Size in bytes. */
    size: number;

    /** Values are in pixels. */
    dimensions: { width: number; height: number };

    status: T;

    uploaded: PostActionBlame;

    approved: T extends PostStatus.InitialAwaitingValidation ? null : PostActionBlame;

    withdrawn: T extends PostStatus.ReAwaitingValidation ? PostActionBlame : null;

    lastModified: PostActionBlame;
}
