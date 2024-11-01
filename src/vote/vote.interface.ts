export type PollOption = {
  name: string;
  symbol?: string; // can we derive this from name
  metadataUrl: string;
  imageUrl: string;
};

export type Poll = {
  id?: string;
  name: string;
  description: string;
  handle?: string;
  options: Array<PollOption>;
  pubkey: string;
};
