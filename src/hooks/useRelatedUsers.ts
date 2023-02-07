import { useContext, useEffect, useState } from 'react';
import { aims } from '../api';
import { messages } from '../constants';
import { SettingsContext, UserSessionContext } from '../contexts';
import { ClientFacingUser, Post, PostStatus } from '../types';

export interface UseRelatedUsersReturn {
    error: string | null;
    uploader: ClientFacingUser | null;
    approver: ClientFacingUser | null;
    withdrawer: ClientFacingUser | null;
    lastModifier: ClientFacingUser | null;
}

/** Fetches related users for a specific post. */
export function useRelatedUsers(post: Post<PostStatus>): UseRelatedUsersReturn {
    const { settings } = useContext(SettingsContext);
    const { user } = useContext(UserSessionContext);

    const [error, setError] = useState<string | null>(null);

    const [uploader, setUploader] = useState<ClientFacingUser | null>(null);
    const [approver, setApprover] = useState<ClientFacingUser | null>(null);
    const [withdrawer, setWithdrawer] = useState<ClientFacingUser | null>(null);
    const [lastModifier, setLastModifier] = useState<ClientFacingUser | null>(null);

    // user fetching
    useEffect(() => {
        // we fetch all users at once since they can all be fetched in 1 api call

        // don't fetch if the new post has the same related users
        if (
            uploader?._id === post.properties.uploaded.by &&
            approver?._id === post.properties.approved?.by &&
            withdrawer?._id === post.properties.withdrawn?.by &&
            lastModifier?._id === post.properties.lastModified.by
        ) {
            return;
        }

        // clear existing error if present
        setError(null);

        // don't fetch if the related users are all just the current in user
        if (
            user &&
            [
                post.properties.uploaded.by,
                post.properties.approved?.by,
                post.properties.withdrawn?.by,
                post.properties.lastModified.by,
            ].every((e) => e === undefined || e === user.userData._id)
        ) {
            setUploader(user.userData);
            setApprover(user.userData);
            setWithdrawer(user.userData);
            setLastModifier(user.userData);
            return;
        }

        const controller = new AbortController();

        const userIds = new Set([post.properties.uploaded.by, post.properties.lastModified.by]);

        if (post.properties.approved) userIds.add(post.properties.approved.by);
        if (post.properties.withdrawn) userIds.add(post.properties.withdrawn.by);

        aims.getSomeUsers(
            {
                baseURL: settings.serverUrl,
                siteToken: undefined,
                controller,
                rateLimitBypassToken: settings.rateLimitBypassToken,
            },
            Array.from(userIds),
        ).then((res) => {
            if (res === 'aborted') return;
            if (res.success) {
                const byId = (id: string) => res.data.find((e) => e._id === id) ?? null;

                setError(null);
                setUploader(byId(post.properties.uploaded.by));
                setApprover(post.properties.approved ? byId(post.properties.approved.by) : null);
                setWithdrawer(post.properties.withdrawn ? byId(post.properties.withdrawn.by) : null);
                setLastModifier(byId(post.properties.lastModified.by));
            } else if (res.generic) setError(messages.genericFail(res));
            else if (res.status === 429) setError(messages[429](res.data));
            else if (res.status === 501) setError(messages[501]);
            else throw res;
        });

        return () => {
            controller.abort();
        };
    }, [
        approver,
        lastModifier,
        post.properties.approved,
        post.properties.lastModified.by,
        post.properties.uploaded.by,
        post.properties.withdrawn,
        settings.rateLimitBypassToken,
        settings.serverUrl,
        uploader,
        user,
        withdrawer,
    ]);

    return {
        error,
        uploader,
        approver,
        withdrawer,
        lastModifier,
    };
}
