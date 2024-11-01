import { RecordId } from 'surrealdb';

export type Credentials = {
  id: RecordId | string;
  email: string;
  password: string;
  isDeleted?: boolean;
};

export type Token = {
  token: string;
  userId: string;
};
