const express = require("express");
const router = require("./router/router");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser")
const app = express();

app.use(express.json());
app.use(cookieParser());
// app.use(express.)
mongoose.connect("mongodb+srv://aakashyadav:aakash123@cluster0.9ubwchn.mongodb.net/task?retryWrites=true&w=majority")
.then(()=>{console.log("database is connected")})
.catch(err=> {console.log(err);})

app.use("/",router);

app.listen(8080, ()=>{
    console.log("server on 8080");
})