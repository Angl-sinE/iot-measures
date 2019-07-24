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

router.get('/biometrica', (request, response, next) => {
	getBiometrica(response);
});

function getBiomecanic (response) {
	ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",(err,conn) =>
	{
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
			conn.query("select tiempo, xo, yo, x1, y1, x2, y2, x3, y3, x4, y4, x5, y5, x6, y6, x7, y7, x8, y8, x9, y9, x11, y11, x12, y12, "+
						  " x13, y13, x14, y14, x16, y16, x17, y17 from "+dataBase+".TABLA_BIOMECANICO", (err, data) => {
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
			conn.query("SELECT temperature, cardiac, created_at, DATE_PART('DAY',created_at)  as dia_med, DAY(current timestamp)  as dia_actual FROM "+dataBase+"."+
			"MEASURES_BIOMETRIC WHERE DATE_PART('YEAR',created_at) = YEAR(current timestamp) AND DATE_PART('MONTH',created_at) = MONTH(current timestamp) AND DATE_PART('DAY',created_at) = DAY(current timestamp)", (err, data) => {
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

function getBiometrica(response) {
	ibmdb.open("DATABASE="+config.dataBase+";HOSTNAME="+config.hostname+";PORT="+config.portNumber+";PROTOCOL=TCPIP;UID="+config.username+";PWD="+config.password+";",(err,conn) =>
	{
		if(err) {
			  console.error("error: ", err.message);
		}
		 else {
			conn.query("SELECT ritmo as cardiac, temperatura as temperature, timestamp(tiempo) as created_at, DATE_PART('DAY', timestamp(tiempo)) as dia_medida FROM "+dataBase+"."+
			"BIOMETRICA WHERE DATE_PART('MONTH',timestamp(tiempo)) = MONTH(current timestamp) FETCH FIRST 150 ROWS ONLY", (err, data) => {
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