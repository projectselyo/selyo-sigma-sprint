export default () => ({
  //surrael DB
  database: {
    URL: process.env.DB_URL,
    NAMESPACE: process.env.DB_NAMESPACE,
    DATABASE: process.env.DB_DATABASE,

    AUTH: {
      username: process.env.DB_AUTH_USER,
      password: process.env.DB_AUTH_PASS,
    },
  },
  email: {
    postmarkApiKey: process.env.POSTMARK_API_KEY,
  },
  sol: {
    ADMIN_WALLET_KEY: process.env.ADMIN_WALLET_KEY,
    GENESIS_ADMIN_WALLET: process.env.GENESIS_ADMIN_WALLET,
    RPC_URL: {
      DEVNET: process.env.SOLANA_EXTERNAL_RPC_URL_DEVNET,
      MAINNET: process.env.SOLANA_EXTERNAL_RPC_URL_MAINNET,
    },
  },
});
