
# Earudite
This repository contains all the components needed to run the Earudite platform. In summary, Earudite is a platform designed to crowdsource the collection of training data using Quiz bowl questions to improve automatic speech recognition systems.

## Building

1. Get the connection string for the MongoDB Client from the Quizzr Atlas (accessed through the Quizzr Google account). 
2. Create a directory at the project root  named `secrets`
3. Generate a private key for the Firebase Admin SDK service account and store it at `secrets/firebase_storage_key.json`
4. Create JSON file `secrets/firebase_client_config.json` as shown below. Make sure to populate the values.
```
{
    "apiKey": "",
    "authDomain": "",
    "projectId": "",
    "storageBucket": "",
    "messagingSenderId": "",
    "appId": ""
}
```
6. Create JSON file `secrets/email_credentials.json` as shown below. Replace <email_address> with the email address to use when sending emails to registering users and <password> with the corresponding password.
```json
{
  "user": "<email_address>"
  "pass": "<password>"
}
```
```sh
export MONGO_CONNECTION_STRING=<connection-string>
export PUBLIC_IP=<public-ip-of-machine>

cp -r secrets/ server/
cp -r secrets/ hls
cp -r secrets/ quizzr-socket-server/
cp -r secrets/ quizzr_server/
cp -r secrets/ browser-asr/src

docker compose build
```

## Running
Make sure you add the public IP to the Firebase authorized domains (under Settings > Authentication)

```sh
docker compose create
docker compose start
```

## Access the Site
After starting docker services, the site should be available at https://PUBLIC_IP:8443 where PUBLIC_IP is the public IP of your VM.
You may need to enable insecure content on your browser, since we are using a self signed certificate for https.
