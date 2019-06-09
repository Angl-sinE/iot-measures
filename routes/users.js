var express = require('express');
var router = express.Router();
var axios = require('axios');
/* GET users listing. */
router.get('/initSession',function(req, res, next){
  let instance = axios.create({
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Authorization': `Basic ZDlhZTZlOWItYzAyZC00OWQxLWI0NjMtMDRlMWYxYjE2ZjA1OjdhNmQyOTZkNjU5OGQ4NTdjZjM3ZDE4MDg3ODQ3ZDgwOTYyMTAxMDQ=`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  console.log('hola bb')
  instance.post('https://us-south.dynamic-dashboard-embedded.cloud.ibm.com/daas/v1/session')
      .then((res) => {
    console.log('hola bb kkk',res.data)
})
.catch((e) => {
    console.log('hola bb kkk',e)
    return e
  })
});

router.get('/', function(req, res, next) {
  res.send('test');
});

module.exports = router;
