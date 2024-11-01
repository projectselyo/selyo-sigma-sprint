import { RecordId } from 'surrealdb';

export type Timestamp = {
  id?: RecordId<string>;
  timestamp: number;
  uid: string;
  email?: string;
  types?: string;
  timestampFormatted?: string;
};
