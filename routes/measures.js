const ibmdb = require('ibm_db');
const express = require('express');
const config = require ('../config/ibm');
const router = express.Router();
const dataBase = 'DASH100433';

router.get('/biomecanic',(request, response, next) =>{
	getBiomecanic(response);
});

router.get('/biometric', (request, response, next) => {
	getBiometric(response);
});

function getBiomecanic (response) {
	ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",(err,conn) =>
	{
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
			conn.query("select tiempo, xo, yo, x1, y1, x2, y2, x3, y3, x4, y4, "+
						  " x16, y16, x17, y17 from "+dataBase+".TABLA_BIOMECANICO", (err, data) => {
				if (err){
					console.log(err);
					response.status(400).json({'error': err});
				} 
				else{
					response.status(200).json({
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
function getBiometric(response) {
	ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",(err,conn) =>
	{
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
			conn.query("SELECT temperature, cardiac, created_at FROM "+dataBase+".MEASURES_BIOMETRIC", (err, data) => {
				if (err){
					console.log(err);
					response.status(400).json({'error': err});
				} 
				else{
					response.status(200).json({
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