const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();
var bodyParser = require('body-parser')
const accountSid = "AC18e83f6668a2fd76c6c8c4d700d233f1";
const authToken = "cf4a13e461c6b69dfc2a78e5ecab5be4";
const client = require('twilio')(accountSid, authToken);  
var session = require('express-session');
app.use(session({
  secret: 'random string',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set("view engine","ejs")
const baseUrl ="https://two-factor-authy.herokuapp.com/"
//const baseUrl ="http://localhost:8081/"

const auth = (req,res,next) =>{
  console.log("Authorization Check")
  if(req.session && req.session.phoneNumber && req.session.code){
    console.log("Session Found")
      next()
}else{
  console.log("Session not Found")
  res.redirect("/error")
}}

app.get('/', function(req, res) {
    res.render("index",{urlBase:baseUrl})
})

app.get('/swagger',(request,response)=>{
  console.log("swagger route")
  response.render("swagger",{urlBase:baseUrl})
})

app.get('/:phoneNumber', function(req, res) {

    if(numValid(req.params["phoneNumber"]) == true){
      req.session.phoneNumber = req.params["phoneNumber"]
      req.session.code = randomCodeGen()
      client.messages.create({body: req.session.code, from: '+19377708295', to: req.session.phoneNumber})
      .then(message => console.log(message.sid));

      res.json({"message":"Ready for next request /phoneNumber/codeFromUser"})
    }else{
      res.json({"error":"Invalid Number"})

    }
    
    //var code = randomCodeGen()
    //res.redirect("/")
});
app.get('/:phoneNumber/:code',auth, function(req, res) {
    if(req.params["code"] == req.session.code && req.params["phoneNumber"] == req.session.phoneNumber){
      res.json({"message":"Phone Number has been authorized","passed":"true"})
    }else{
      res.json({"message":"2FA Failed, code wrong","passed":"false"})
    }
    req.session.destroy()
});
app.get('/error', function(req, res) {
    res.json({"error":"Not Valid Request"})
});
app.listen(process.env.PORT || 4000, function(){
    console.log('Your node js server is running');
});
function randomCodeGen(){
  var code = []
  for(i=0;i<5;i++){
    min = Math.ceil(0);
    max = Math.floor(10);
    code.push(Math.floor(Math.random() * (max - min) + min))
  }
  code = code.join('')
  return code
}
function numValid(num)
{
  numToString = num.toString()
  if(numToString.match(/^\d{10}$/)){
    return true
  }
  return false
       
}

