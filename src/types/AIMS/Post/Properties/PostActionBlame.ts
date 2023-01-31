import { UserIdentificationString, ISOString } from '../../Utility';

export interface PostActionBlame {
    by: UserIdentificationString;
    at: ISOString;
}
