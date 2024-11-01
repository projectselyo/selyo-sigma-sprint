const crypto = require('crypto');

export const GENESIS_NFTS_COLLECTION = [
  {
    name: 'Selyo QUEST: Genesis - Moonboy',
    metadata: 'https://arweave.net/zeVv7qY2NyEtAfMA8aCyvUbKtv30WDgMIUWUJW-Wpis',
  },
  {
    name: 'Selyo QUEST: Genesis - Russ',
    metadata: 'https://arweave.net/T0-Agz253yNcVqDGFL0a9OS6-IInmU5hjTSckbi1g1E',
  },
  {
    name: 'Selyo QUEST: Genesis - Banawi',
    metadata: 'https://arweave.net/Kw4E_slYqntQD6eP-I4I7rjayLdqjcM2tqQeViio9FY',
  },
  {
    name: 'Selyo QUEST: Genesis - Moongirl',
    metadata: 'https://arweave.net/pjepdudFFl7WzYwHqHdeSsOcmkE4GcjMLXyRUHeW1tw',
  },
  {
    name: 'Selyo QUEST: Genesis - Binundo',
    metadata: 'https://arweave.net/vSdXsRbTCuGwJ5S7FzwnQgBl1OQkRlmVP91l9A8maWM',
  },
  {
    name: 'Selyo QUEST: Genesis - Mayun',
    metadata: 'https://arweave.net/Dg_0BJ5P7YNiF1_IFqoFm8FKxk1EnWbHHTY05n_lMTk',
  },
  {
    name: 'Selyo QUEST: Genesis - Tal',
    metadata: 'https://arweave.net/9prRO30A9UJkfipRkrJ48jF8L2yKRFxn16t585H5MxM',
  },
  {
    name: 'Selyo QUEST: Genesis - Dabaw',
    metadata: 'https://arweave.net/uTt1hSEI0ebWCnOkOqcQzzghYOh917SPvDstP80Fz5Q',
  },
  {
    name: 'Selyo QUEST: Genesis - Burakay',
    metadata: 'https://arweave.net/T94xFQTYTty0tW3dHvuMOyvfsRearl_-8p-5KarY7lY',
  },
  {
    name: 'Selyo QUEST: Genesis - Manilya',
    metadata: 'https://arweave.net/H_cDmSma3pPW1wQNnJIxVoN4Bh2VJwxNHyo0t8L0ESo',
  },
  {
    name: 'Selyo QUEST: Genesis - Bagew',
    metadata: 'https://arweave.net/T0Dewim8dPFYnEj_3uUw0wwCrhBAeERPK1taC6ZBp9w',
  },
  {
    name: 'Selyo QUEST: Genesis - Manda',
    metadata: 'https://arweave.net/AzNnxd6gNJKVPGfypXMBC0MBpb1QOyl5oud87xo8iw8',
  },
  {
    name: 'Selyo QUEST: Genesis - Fildera',
    metadata: 'https://arweave.net/yEhkLOnGcwEXkwoBwlvDi7zrIdGit_ifOaZWs5LtkJ8',
  },
];

export async function getRandomInt(min, max) {
  // Ensure min is less than max
  if (min >= max) {
    throw new Error('Min must be less than max');
  }

  return new Promise((resolve, reject) => {
    crypto.randomInt(min, max + 1, (err, n) => {
      if (err) reject(err);
      else resolve(n);
    });
  });
}
