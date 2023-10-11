const express = require('express');
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const userModel = require('./models/userModel');
const { hashSync } = require('bcrypt');
var session = require('express-session')
const MongoStore = require('connect-mongo');
const passport = require('passport');
const app = express();

try {
    mongoose.connect('mongodb://127.0.0.1/passport');
} catch (error) {
    console.log(error);
}

const db = mongoose.connection;

db.on('connected', function () {
    console.log('Mongoose default connection established.');
});

db.on('close', function () {
    console.log('Mongoose connection closed.');
});

// When the connection is disconnected
db.on('disconnected', function () {
    console.log('Mongoose default connection ended.');
});

app.set('view engine','ejs')
app.use(express.urlencoded({extended: true}))

app.set('trust proxy', 1)
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: 'mongodb://127.0.0.1/passport',collectionName: 'sessions'}),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24
     }
}))

require('./config/passport')

app.use(passport.initialize())
app.use(passport.session())

app.get('/login',(req,res) => {
    res.render('login')
})

app.get('/register',(req,res) => {
    res.render('register')
})

app.post('/login',passport.authenticate('local',{successRedirect: 'protected',failureRedirect: 'login'}))

app.post('/register',(req,res) => {
    let user = new userModel({
        username: req.body.username,
        password: hashSync(req.body.password,10) 
    })

    user.save().then(user => console.log(user))

    res.send({success: true})
})

app.get('/logout',(req,res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("/login")
      });
})

app.get('/protected',(req,res) => {
    if(req.isAuthenticated()){
        res.send("Protected");
    }else{
        res.status(401).send({msg:"Unauthorized"})
    }
})

app.listen(PORT,(req,res)=>{
    console.log("server is running at PORT",PORT);
});