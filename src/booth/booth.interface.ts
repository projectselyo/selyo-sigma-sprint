// using alllbooth to get the all available booths
export type AllBooth = {
  boothID: number;
  boothname: string;
};

export type Booth = {
  name: string;
  owner: string;
};

export const allbooths: AllBooth[] = [
  {
    boothID: 1,
    boothname: 'OKX',
  },
  {
    boothID: 2,
    boothname: 'The BLOKC',
  },
  {
    boothID: 3,
    boothname: 'Solana Superteam Ph',
  },
];

// BoothStamp
export type BoothStamp = {
  id?: string;
  boothId: string;
  collectionPubkey: string;
  collectionMetadataUri: string;
  collectionName: string;
  creationTx?: string;
};

//for validating
export type Email = {
  EmailID: number;
  EmailFromStamp: string;
  GotStampFrom: string;
};

export const passed: Email[] = [
  {
    EmailID: 1,
    EmailFromStamp: 'budjiangelo@gmail.com',
    GotStampFrom: 'Solana Superteam Ph',
  },
  {
    EmailID: 2,
    EmailFromStamp: 'budjiangelo@gmail.com',
    GotStampFrom: 'OKX',
  },
  {
    EmailID: 3,
    EmailFromStamp: 'budjiangelo@gmail.com',
    GotStampFrom: 'The BLOKC',
  },
];

export type TimeStampReport = {
  name?: string;
  owner?: string;
};
