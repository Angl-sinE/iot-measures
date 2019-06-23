var ibmdb = require('ibm_db');
var express = require('express');
var config = require ('../config/db2');
var router = express.Router();



router.get('/getData',function(req, res, next){
	getTable1(res);
});



function getTable1 (res) {
	ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",function(err,conn){
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
			conn.query('select puntaje, cx, cy, cronologia, fstr from DASH100433.TABLITA3', function (err, data) {
				if (err){
					console.log(err);
					res.status(400).json({'error': err});
				} 
				else{
					res.status(200).json({
						'data': data
					});
				} 
				conn.close(function () {
					console.log('done');
			    });		
			});
		}
	
	});
}
module.exports = router;