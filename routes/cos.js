var express = require('express');
const AWS = require('ibm-cos-sdk');
var router = express.Router();



var config = {
    endpoint: 's3.us.cloud-object-storage.appdomain.cloud',
    apiKeyId: 'uLIUWOsvhfi8DyrVr9l3YGeMxVyXYNh1jrdwT0hiwaXC',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/df4f0fcca34e47e38ebf5116ed93d0f0:0fb95aa0-347f-4fed-a13c-16e20b70abf6::',
};

var cos = new AWS.S3(config);

router.post('/',function(req, res, next){
  createTextFile(req.body.bucket_name,req.body.itemName,req.body.fileText)
});

function createTextFile(bucketName, itemName, fileText) {
    console.log(`Creating new item: ${itemName}`);
    return cos.putObject({
        Bucket: bucketName, 
        Key: itemName, 
        Body: fileText
    }).promise()
    .then(() => {
        console.log(`Item: ${itemName} created!`);
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}
module.exports = router;
  