const mongoose = require("mongoose");

const DB = "mongodb+srv://passwords.ue9uo.mongodb.net/GoShopping?retryWrites=true&w=majority"

mongoose.connect(DB).then(()=>console.log("data base Connected")).catch((error)=> console.log("error" + error.message))
