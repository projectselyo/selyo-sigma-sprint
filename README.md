# project-selyo-api

API for the upcoming Selyo Project - an integration of ESP32-enabled device capable of scanning Web3 NFC badges that serves as digital ID powered by Solana

![Panatak Logo](./docs/panatak.png)

## features

### Scan your NFC badge on `PANATAK`
- time-in (entry)
- time-out (exit)
- booth stamp
- claim merchandise

### Scan your NFC via phone
- visit your public profile on Project Selyo Webapp
- view your collected stamps
- view your contact details

how to start the project-selyo-api


### Running your local database
### Run db in your terminal
```sh
surreal start --log trace --user root --pass root file:db/selyo-api.db
```

### cd to project-selyo-api
```sh
cd project-selyo-api
```

### install all dependencies
```sh
npm i
```

### Run the project: cd to project-selyo-api
```sh
npm run start:dev
```