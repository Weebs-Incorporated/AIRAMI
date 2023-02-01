import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export interface RelativeTimeStringProps extends React.CSSProperties {
    /** The ISO string of the time to display relative to now. */
    time: string;
    /** If true, displays relative time without suffix, e.g. "2 days" instead of "2 days ago". */
    withoutSuffix?: boolean;
    /** Interval between re-renders in milliseconds, default 1000. */
    intervalMs?: number;
    /** Whether to wrap the relative time in brackets. */
    inBrackets?: boolean;
}

/** Displays relative time parsed using {@link https://day.js.org/ dayjs}, updating it every X milliseconds. */
const RelativeTimeString = (props: RelativeTimeStringProps) => {
    const { time, withoutSuffix, intervalMs, inBrackets, ...style } = props;

    const [relativeTime, setRelativeTime] = useState(dayjs(time).fromNow(withoutSuffix));

    useEffect(() => {
        const interval = setInterval(() => setRelativeTime(dayjs(time).fromNow(withoutSuffix)), intervalMs ?? 1000);

        return () => {
            clearInterval(interval);
        };
    }, [intervalMs, time, withoutSuffix]);

    return (
        <span style={style}>
            {inBrackets && '('}
            {relativeTime}
            {inBrackets && ')'}
        </span>
    );
};

export default RelativeTimeString;
