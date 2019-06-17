var ibmdb = require('ibm_db');
var express = require('express');
var config = require ('../config/db2');
var router = express.Router();

ibmdb.open("DRIVER={DB2};DATABASE="+config.dataBase+";UID="+config.username+";PWD="+config.password+";HOSTNAME="+config.hostname+"port="+config.portNumber,function(err,conn){
    if(err) {
	  	console.error("error: ", err.message);
	}
	 else {
		conn.query('select 1 from sysibm.sysdummy1', function (err, data) {
			
		});
    }

});

router.get('/getData',function(req, res, next){
	console.log (config.hostname );
});
module.exports = router;