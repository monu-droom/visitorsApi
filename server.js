const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const multer = require('multer');
const path = require('path');


const app = express();

const PORT = 2000;

const mysql = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'Monu@123',
  database : 'visitors'
});
  
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected with mysql database...')
});

app.use(express.static('./public'));

app.use(bodyParser.json({limit: "50mb", type:'application/json'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000, type:'application/x-www-form-urlencoded'}));
app.use(cookieParser());

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

const username = 'owovisitor@owo.in'
const password = '123456'

// a variable to save a session
var session;
var storage = multer.diskStorage({
      destination: (req, file, callBack) => {
        callBack(null, './public')     // './public/' directory name where save the file
      },
      filename: (req, file, callBack) => {
          callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
      }
    });    
const upload = multer({ storage: storage });
//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));
app.post('/add-visitor', upload.single('photo'), function(req, res){
  console.log();
    var imgsrc = req.headers.host + '/' + req.file.filename;
    var keys = ['name', 'phone', 'address', 'whom_to_meet', 'purpose', 'photo'];
    var values = [req.body.name, req.body.phone, req.body.address, req.body.whom_to_meet, req.body.purpose, imgsrc];
    var obj = {}; 
    for(var i = 0; i < keys.length; i++){
        obj[keys[i]] = values[i];
    }
    connection.query('INSERT INTO visitors SET ?', obj, function (error, results, fields) {
        if (error) throw error;
        else console.log('Data saved to table');        
        res.end(JSON.stringify(results));
    });
});

app.get('/visitors', function(req, res){
    connection.query('select * from visitors', function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });     
});

app.post('/login',(req,res) => {
    if(req.body.username == username && req.body.password == password){
        session=req.session;
        session.userid=req.body.username;
        console.log('Logged in successfully!');
        res.send(`Hey there, welcome Admin.`);
    }
    else{
        res.send('Invalid username or password');
    }
});

app.get('/logout',(req,res) => {
    req.session.destroy();
    res.send(`Admin logged out!`);
    console.log('Logged out successfully!');
});


app.listen(PORT, function (){
    console.log(`listening at port ${PORT}`);
});