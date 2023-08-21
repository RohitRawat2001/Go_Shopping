const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const secretKey = "";


const authenicate = async(req,res,next)=>{
    try {
        const token = req.cookies.GoShopping;
        
        const verifyToken = jwt.verify(token,secretKey);
        console.log(verifyToken);
     
        const rootUser = await User.findOne({_id:verifyToken._id,"tokens.token":token});
       console.log(rootUser);

        if(!rootUser){ throw new Error("User Not Found") };

        req.token = token; 
        req.rootUser = rootUser;   
        req.userID = rootUser._id;   
    
        next();  


    } catch (error) {
        res.status(401).send("Unauthorized:No token provided");
        console.log(error);
    }
};

module.exports = authenicate;
