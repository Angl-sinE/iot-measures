var express = require('express');
const AWS = require('ibm-cos-sdk');
var multer = require('multer');
var appRoot = require('app-root-path');
var multParse = multer();
var router = express.Router();
const { createLogger, format, transports } = require('winston');


const logger = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [new transports.Console()],
    exceptionHandlers: [
        new transports.File({ filename:  `${appRoot}/logs/exceptions.log` }),
        new transports.Console({handleExceptions: true})
    ],
});
  

var config = {
    endpoint: 's3.us-south.cloud-object-storage.appdomain.cloud',
    apiKeyId: '2sZdyb9eCSzdrvhhXHOsHrjLe-4NYb9E00Mcesr1kK0P',
    ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
    serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/f899bf894f7142cfb8e0c7bc2a940ece:b14423ea-babc-4971-8ce4-9c09a7e3cb60::',
};

var cos = new AWS.S3(config);


router.get('/', function (req,res,next){
    doGetObject();
});

function doGetObject() {
 console.log('Getting object');
  return cos.getObject({
     Bucket: 'feptarco',
     Key: 'T-16-05-2019-3-20-45-am'
  }).createReadStream().pipe(fs.createWriteStream('./MyObject'));
}
    
  

router.post('/',function(req, res, next){
   var dataCheck = checkType(req.body) 
   console.log('data: ', req.body) 
   if (dataCheck){
     var itemName = 'T'+'-'+getDate(new Date());
     console.log('item: ', itemName);
     createObjectInBucket(itemName,req.body, res);
   } 
   else 
    res.status(303).json({message : 'Error: Archivo Invalido', status: 303});
});

router.get('/getObject', function (req,res,next) {
    getObjectFromBucket('feptarco', 'T-16-05-2019-3-20-45-am' ,res);
});

router.get('/getBucketObjs', function(req,res,next){
    getBucketContents('feptarco',res);
});
function getBucketContents(bucketName, res) {
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    return cos.listObjects(
        {Bucket: bucketName},
    ).promise()
    .then((data) => {
        if (data != null && data.Contents != null) {
            for (var i = 0; i < data.Contents.length; i++) {
                var itemKey = data.Contents[i].Key;
                var itemSize = data.Contents[i].Size;
                console.log(`Item: ${itemKey} (${itemSize} bytes).`)
            }
        res.status(200).json({
            'data': data.Contents
        });
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}


/**
 * 
 * @param {*} bucketName 
 * @param {*} itemName 
 */
function getObjectFromBucket(bucketName, itemName, res) {
    console.log(`Retrieving item from bucket: ${bucketName}, key: ${itemName}`);
    return cos.getObject({
        Bucket: bucketName, 
        Key: itemName
    }).promise()
    .then((data) => {
        if (data != null) {
            console.log('File Contents: ' + Buffer.from(data.Body).toString());
            let value = Buffer.from(data.Body).toString();
            res.status(200).json({
                'data':value
            });
        }    
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}


/**
 * 
 * @param {*} itemName 
 * @param {*} fileText 
 * @param {*} res 
 */
function createObjectInBucket(itemName, fileText, res) {
    console.log(`Creando objeto: ${itemName}`); 
    jsonString = JSON.stringify(fileText)
    console.log(`Values: ${jsonString}`); 
    var card = JSON.parse(jsonString).card;
    var temp = JSON.parse(jsonString).temp;
    jsonString = checkCardiacValue(card,temp);    
    return cos.putObject({
        Bucket: 'feptarco', 
        Key: itemName, 
        Body: jsonString
    }).promise()
    .then(() => {
        console.log(`Item: ${itemName} created!`);
        res.status(200).send('Success');
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
        logger.error(logger.exceptions.getAllInfo(e));
        res.status(500).json({message : 'Error: '+e.message, status: 500});
    });
        
}

/**
 * Replaces the extra value in the cardiac measure and 
 * creates a new jsonString
 * @param {*} card 
 * @param {*} temp 
 */
function checkCardiacValue(card, temp){
    var jsonData = {};
    var measures = []
    jsonData.measures = measures;
    var cardInt = parseInt(card);
    if (cardInt >= 900){
        newCardValue = card.replace("9", "");
        var measure ={
            "temp": temp,
            "card": newCardValue
        };
    }
    else{
        var measure ={
            "temp": temp,
            "card": card
        };
    }
    jsonData.measures.push(measure);
    console.log("data: ", jsonData);
    
    
    return JSON.stringify(jsonData);
    
}
/**
 * Checks if the type is defined
 * @param  body 
 */
function checkType(body) {
   if (body === undefined)
        return false
    else
        return true    
}

/**
 * Returns a formatted date
 * @param {*} date 
 */
function getDate(date){
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var month = ("0" + (date.getMonth() + 1)).slice(-2)
    var strTime = hours + '-' + minutes + '-'+seconds+'-'+ampm;
    return date.getDate()  + "-" + month + "-" + date.getFullYear() + "-" + strTime;
}

module.exports = router;
  