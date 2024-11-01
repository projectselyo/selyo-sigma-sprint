export type User = {
  id?: string;
  email: string;
  name: string;
  isDeleted: boolean;

  uid?: string;
  publicKey?: string;
  privateKey?: string;
  handle?: string;
};

export type MagicLogin = {
  id?: string;
  email: string;
  code: string;
  isClaimed: boolean;
};

export type TxPending = {
  id?: string;
  email: string;
  action: string;
};
