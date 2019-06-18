//var ibmdb = require('ibm_db');
var express = require('express');
var config = require ('../config/db2');
var router = express.Router();

ibmdb.open("DATABASE=BLUDB;HOSTNAME=dashdb-entry-yp-dal09-08.services.dal.bluemix.net;PORT=50000;PROTOCOL=TCPIP;UID=dash100433;PWD=(QGRmbVi8ljE;",function(err,conn){
    if(err) {
	  	console.error("error: ", err.message);
	}
	 else {
		conn.query('select 1 from sysibm.sysdummy1', function (err, data) {
			
		});
    }

});

router.get('/getData',function(req, res, next){
});
module.exports = router;