var express = require('express');
const AWS = require('ibm-cos-sdk');
var router = express.Router();



var config = {
    endpoint: 's3.us-south.cloud-object-storage.appdomain.cloud',
    apiKeyId: '2sZdyb9eCSzdrvhhXHOsHrjLe-4NYb9E00Mcesr1kK0P',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/f899bf894f7142cfb8e0c7bc2a940ece:b14423ea-babc-4971-8ce4-9c09a7e3cb60::',
};

var cos = new AWS.S3(config);

router.post('/',function(req, res, next){
  createTextFile(req.body.bucket_name,req.body.itemName,req.body.fileText, res)
});

function createTextFile(bucketName, itemName, fileText, res) {
    console.log(`Creating new item: ${itemName}`);
    return cos.putObject({
        Bucket: bucketName, 
        Key: itemName, 
        Body: fileText
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
module.exports = router;
  