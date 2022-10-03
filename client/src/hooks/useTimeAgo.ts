import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addDefaultLocale(en);

export default function useTimeAgo(): TimeAgo {
    return new TimeAgo('en-US');
}