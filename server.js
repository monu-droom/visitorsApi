const express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');

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

app.use(express.static(__dirname));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

const username = 'owovisitor@owo.in'
const password = '123456'

// a variable to save a session
var session;

//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.post('/add-visitor', function(req, res){
    const params  = req.body;
    connection.query('INSERT INTO visitors SET ?', params, function (error, results, fields) {
        if (error) throw error;
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