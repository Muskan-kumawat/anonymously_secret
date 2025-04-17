const express = require('express');
const bodyParser = require('body-parser');
const encrypt = require('mongoose-encryption');
const ejs = require('ejs');
const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({});

var app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));



// mongoose.connect("mongodb://localhost:27017/secrets");
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

const trySchema = new mongoose.Schema({
    email : String,
    password : String,
    secrets : String
});


const secret = "thisislittlesecret.";
trySchema.plugin(encrypt,{secret: secret, encryptedFields:["password"]});

const item = mongoose.model("second", trySchema);
// const secrects = mongoose.model("secrets", trySchema);

let newSecret = "Jack Bauer is my hero."; 

app.post("/register",async function(req, res){
    try{   
        const newUser = new item({
            email : req.body.username,
            password : req.body.password
        });
        await newUser.save();
        res.redirect("/secrets");
    }
    catch(err){
        console.log(err);
    }
});

app.post("/login",async function(req, res){
      
    const username = req.body.username;
    const password = req.body.password;
    try{ 
        const foundUser = await item.findOne({email: username});
        if(foundUser){
            if(foundUser.password === password){
                res.redirect("/secrets");
            }
            else{
                res.send("Incorrect password.");
            }   
        }
        else{
            res.send("User not found.");
        }
    }
    catch(err){
        console.log(err);
    }
});

  
app.post("/submit", (req, res) => {
    newSecret = req.body.secret;
    const input = new item({
        secrets : newSecret
    });
    input.save();
    res.render("secrets",{secret: newSecret});
    // try{
    //     await item.findByIdAndUpdate({_id: '68010f6ee50ab3a13196597a'}, { secrets: newSecret },{ new: true } );
    
    //     res.render("secrets",{secret: newSecret});
    // }
    // catch(err){
    //     console.log(err);
    // }
    
});



// route defined  

app.get("/",function(req, res){
    res.render("home");
});

app.get("/login",function(req, res){
    res.render("login");
});

app.get("/register",function(req, res){
    res.render("register");
});
app.get("/secrets",(req, res) => res.render("secrets",{secret: newSecret}));



app.get("/submit",(req, res) => res.render("submit"));
app.get("/logout",(req, res) => res.render("home"));


app.listen(3000,() => {
    console.log("Server started on port 3000");
});
