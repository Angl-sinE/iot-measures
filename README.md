# Feptarco Iot-API 

Api que envia data de sensores Feptarco a IBM cloud bucket

## Use App
* npm install
* npm start

## Production 
* cd bin/
* forever start www

## Requests
* GET - /test
* GET - measures/biomecanic
* GET - measures/biometric

#Deploy IBM-Cloud
* ibmcloud login
* ibmcloud target --cf
* ibmcloud cf push iot-measure-api




