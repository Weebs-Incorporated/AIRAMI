import React, { useState } from 'react';
import { DiscordIcon } from '../../images';
import { ClientFacingUser, User } from '../../types';

export interface ProfilePictureProps {
    user: ClientFacingUser | User | null;
    isSelf?: boolean;
    size?: number;
    style?: React.CSSProperties;
}

const ProfilePicture = (props: ProfilePictureProps) => {
    const { user, isSelf, size = 64, style } = props;

    const [errored, setErrored] = useState(false);

    if (!!user && user.avatar !== null && !errored) {
        return (
            <img
                width={size}
                height={size}
                src={`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png`}
                alt={isSelf ? 'Your Discord profile' : `Discord profile of ${user.username}`}
                style={{ borderRadius: '50%', ...style }}
                loading="lazy"
                onError={(e) => {
                    e.preventDefault();
                    setErrored(true);
                }}
            />
        );
    }

    return <DiscordIcon width={size} height={size} style={style} fill={style?.color ?? 'white'} />;
};

export default ProfilePicture;
