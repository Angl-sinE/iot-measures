var express = require('express');
const AWS = require('ibm-cos-sdk');
var ibmdb = require('ibm_db');
var appRoot = require('app-root-path');
var router = express.Router();
var axios = require('axios');
var config = require ('../config/db2');
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

router.post('/',function(req, res, next){
   var dataCheck = checkType(req.body)
   console.log('data: ', req.body)
   if (dataCheck){
     var itemName = 'T'+'-'+getDate(new Date());
     console.log('item: ', itemName);
     createObjectInBucket(itemName,req.body, res);
     //insertMeasures(res,req.body);
   }
   else
    res.status(303).json({message : 'Error: Archivo Invalido', status: 303});
});

router.get('/getObject', function (req,res,next) {

    if (req.query.name !== undefined)
        getObjectFromBucket('feptarco', req.query.name ,res);
    else
        res.status(404).json({message : 'Nombre de objeto no definido', status: 404});
});

router.get('/getBucketObjs', function(req,res,next){
    getBucketObjects('feptarco',res);
});

router.get('/getBucketContents', function(req,res,next) {
      getBucketObjectList('feptarco', res);

});

function insertMeasures(res, content){
    var jsonContent = JSON.stringify(content)
    var card = JSON.parse(jsonContent).card;
    var temp = JSON.parse(jsonContent).temp;
    card = checkCardiacValue(card);
    console.log(`Values: ${card}`);
     
    ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",function(err,conn){
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
            conn.prepare("INSERT INTO DASH100433.MEASURES_BIOMETRIC (created_at, temperature, cardiac) VALUES (current_timestamp,?,?)" , function (err, stmt) {     
				if (err){
                    return conn.closeSync();
				} 
                    stmt.execute([temp, card], function (err, result) {
                        if( err ) console.log(err);  
                        else result.closeSync();  
                        //Close the connection
                        conn.close(function(err){});
                      });    		
			});
		}
    });
    
}

/**
 * Returns the objects content of the bucket
 * @param {*} bucketName
 * @param {*} res
 */
 function getBucketObjectList(bucketName, res){
    return cos.listObjects(
        {Bucket: bucketName},
    ).promise()
    .then((data) => {
        if(data != null && data.Contents != null){
            var measures = [];
            for (var i = 0; i < data.Contents.length; i++) {
                var item = data.Contents[i].Key;
                measures.push(item);
                /*
                return getObjectFromBucket(bucketName, item, res).then((res) => {
                    measures.push(res);
                    return measures;
                });
                */
            }
            console.log(measures);
            return measures;
        }
    });
}



/**
 * Returns all objects from a bucket
 * @param {*} bucketName
 * @param {*} res
 */
function getBucketObjects(bucketName, res) {
    console.log(`Retrieving bucket contents from: ${bucketName}`);
    return cos.listObjects(
        {Bucket: bucketName},
    ).promise()
    .then((data) => {
        if (data != null && data.Contents != null) {
            var contents = []
            for (var i = 0; i < data.Contents.length; i++) {
                var itemKey = data.Contents[i].Key;
                contents.push(itemKey);

            }
        res.status(200).json({
            'data': contents
        });
        }
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
    });
}

/**
 * Returns object from a bucket given name
 * @param {*} bucketName
 * @param {*} itemName
 */
 function getObjectFromBucket (bucketName, itemName, res) {
    return cos.getObject({
        Bucket: bucketName,
        Key: itemName
    }).promise()
    .then((data) => {
        if (data != null) {
            res.status(200).json({
                data: Buffer.from(data.Body).toString()
            });
        }
    })
    .catch((e) => {
        console.error(`ERROR: ${e.code} - ${e.message}\n`);
        return e;
    });
}

/**
 * Creates an object in the IBM Cloud Storage Bucket
 * @param {*} itemName
 * @param {*} fileText
 * @param {*} res
 */
function createObjectInBucket(itemName, fileText, res) {
    jsonString = JSON.stringify(fileText)
    console.log(`Values: ${jsonString}`);
    var card = JSON.parse(jsonString).card;
    var temp = JSON.parse(jsonString).temp;
    jsonString = checkCardiacValueOld(card,temp);
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
function checkCardiacValue(card){
    var cardInt = parseInt(card);
    if (cardInt >= 900){
        var newCardValue = card.replace("9", "");
        card = newCardValue;
    }
    return card;

}

function checkCardiacValueOld(card, temp){
    var jsonData = {};
    var measures = []
    jsonData.measures = measures;
    var cardInt = parseInt(card);
    if (cardInt >= 900){
        newCardValue = card.replace("9", "");
        var measure ={
            "temp": temp,
            "card": newCardValue,
            "date": getDate(new Date())
        };
    }
    else{
        var measure ={
            "temp": temp,
            "card": card,
            "date": getDate(new Date())
        };
    }
    jsonData.measures.push(measure);
    console.log(jsonData);
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
