var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response, next) {
  response.status(200).json({'status' : 'Ok'});
});

module.exports = router;
