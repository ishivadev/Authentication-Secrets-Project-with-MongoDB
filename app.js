//jshint esversion:6

import express, { response } from 'express';
import bodyParser from 'body-parser';
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import mongoose from 'mongoose';
import  { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

//Salt round that will add with the plain text
const saltRounds = 10;

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema({
    username : String,
    password : String
})

//Creating model for the collection
const userModel_2 = mongoose.model("userDetail", userSchema)

app.get("/", function(req, res) {
    //res.sendFile(__dirname + "/public/index.html")
    res.render("home.ejs");
})

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.get("/register", (req, res) => {
    res.render("register.ejs");
})

app.get("/logout", (req, res) => {
    res.render("home.ejs");
    console.log("The user logout successfully.");
})


app.post("/register", async function(req, res) {
    //Using bcrypt technique for storing salted password in db

    try {
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = new userModel_2 ({
            username : req.body.username,
            password : hash
        });

        await newUser.save();
        res.render("secrets.ejs");
        console.log("New user registered successfully.");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error registering user.");
    }
});


app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    //Retrieving password from db which is stored in bcrypt format
    userModel_2.findOne({ username : username })
        .then( function(data) {
            if(data) {
                bcrypt.compare(password, data.password, function(err, result) {
                    if (result) {
                        res.render("secrets.ejs");
                        console.log("User login successfully.");
                } else {
                    console.log("Wrong password, kindly check the password: " + password);
                }})
            } else {
                console.log("Not a valid user details.", '\n', 
                            "Entered username is :" + username, '\n',
                            "Entered password is :" + password);
            }
        })
        .catch(function(err){
            console.log(err);
        })
})



app.listen(port, function() {
    console.log("Server started on port no : ", +port);
})