var express = require('express');
var router = express.Router();
var axios = require('axios');
var CognosApi;
var sessionCode;
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
  instance.post('https://us-south.dynamic-dashboard-embedded.cloud.ibm.com/daas/v1/session')
      .then((res) => {
    console.log(res.data);
})
.catch((e) => {
    console.log('Error: ',e)
    return e
  })
});


async function createAndInitApiFramework() {
  console.log("in create and init api framework");

  // Create an instance of the CognosApi
  this.api = new CognosApi({
        cognosRootURL: environment.cognos_root_url,
        sessionCode: this.session.code,
        initTimeout: 10000,
        node: document.getElementById('ddeDashboard')
        });

  this.api._node.hidden = false;

  try {
    await this.api.initialize();
    console.log('API created successfully.');
  } catch (e) {
    console.log('Unable to initialize API instance: ' + e.message);
    throw e;
  }

  console.log(this.api.dashboard);
  return this.api.apiId;
}



module.exports = router;
