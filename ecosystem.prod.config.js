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
      name: 'selyo-api-3',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3032
      }
    },
    {
      name: 'selyo-api-4',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3033
      }
    },
    {
      name: 'selyo-api-5',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3034
      }
    },
    {
      name: 'selyo-api-6',
      cron_restart: '*/30 * * * *',
      script: 'npm run start',
      exec_mode: 'fork',
      env: {
        PORT: 3035
      }
    },
    {
      name: 'selyo-db',
      script:
        'surreal start --log trace --user root --pass root file:db/selyo-api.db',
    },
  ],
};
