module.exports = {
  apps: [
    {
      name: 'selyo-api-1',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3030
      }
    },
    {
      name: 'selyo-api-2',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3031
      }
    },
    {
      name: 'selyo-db',
      script:
        'surreal start --log trace --user root --pass root file:db/selyo-api.db',
    },
  ],
};
