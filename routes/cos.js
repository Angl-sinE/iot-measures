var express = require('express');
const AWS = require('ibm-cos-sdk');
var multer = require('multer');
var fs = require('fs'),obj;
var multParse = multer();
var router = express.Router();

var config = {
    endpoint: 's3.us-south.cloud-object-storage.appdomain.cloud',
    apiKeyId: '2sZdyb9eCSzdrvhhXHOsHrjLe-4NYb9E00Mcesr1kK0P',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/f899bf894f7142cfb8e0c7bc2a940ece:b14423ea-babc-4971-8ce4-9c09a7e3cb60::',
};

var cos = new AWS.S3(config);

router.post('/',multParse.single('file'),function(req, res, next){
   var dataCheck = checkType(req.file)
   
   if (dataCheck) 
     createTextFile(req.body.bucketName,req.body.itemName,req.file, res)
  else 
    res.status(500).json({message : 'Error: Archivo Invalido', status: 500});
});

function createTextFile(bucketName, itemName, fileText, res) {
    console.log(`Creating new item: ${itemName}`); 
    jsonString =  JSON.stringify(fileText)
    return cos.putObject({
        Bucket: bucketName, 
        Key: itemName, 
        Body: jsonString
    }).promise()
    .then(() => {
        console.log(`Item: ${itemName} created!`);
        res.status(200).json({message : 'Success', status: 200});
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
        res.status(500).json({message : 'Error: '+e.message, status: 500});
    });
    
}
/**
 * Verifica si el archivo es tipo json
 * @param  body 
 */
function checkType(body) {
    if (body.mimetype === 'application/json')
        return true
    else
        return false
}

module.exports = router;
  