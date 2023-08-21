const express = require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenicate= require("../middleware/authenticate");

// get productsdata api
router.get("/getproducts", async(req,res )=>{
try {
    const productsdata = await Products.find();
    // console.log("console the data" + productsdata);
    res.status(201).json(productsdata);
} catch (error) {
    console.log("error" +error.message);
}
});

//get individual data
router.get("/getproductsone/:id", async (req, res) => {

    try {
        const {id} = req.params;
        console.log(id);

        const individual = await Products.findOne({id:id});
         console.log(individual + "individual data");

        res.status(201).json(individual);
    } catch (error) {
       res.status(400).json(individual);
       console.log("error" +error.message);
      
    }
});

// register data

router.post("/register", async (req, res) => {
    // console.log(req.body);

    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("not data available");
    };

    
    try {

        const preuser = await USER.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This User is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new USER({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge

            const storedata = await finaluser.save();
             console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        // console.log("error the bhai catch ma for registratoin time" + error.message);
        // res.status(422).send(error);
    }


});



// login user api
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill all the details" });
    };
   
    try {

        const userlogin = await USER.findOne({ email: email });
        console.log(userlogin);
        
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);


            // token generate
            const token = await userlogin.generateAuthtoken();
            console.log(token);

            res.cookie("GoShopping", token, {
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });



            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {
                res.status(201).json(userlogin);

                // res.status(201).json(userlogin);
            }

        } 
        
        else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        //console.log("error the bhai catch ma for login time" + error.message);
    }
});

// adding the data into cart
router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        //console.log("perfect 6");
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart milta hain");

        const Usercontact = await USER.findOne({ _id: req.userID });
        console.log(Usercontact + "user milta hain");


        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            console.log(cartData + " thse save wait kr");
           // console.log(Usercontact + "userjode save");
            res.status(201).json(Usercontact);
        }else{
            res.status(401).json({error:"invalid user"});
        }
    } catch (error) {
        //console.log(error);
        res.status(401).json({error:"invalid user"});
    }
});


//get card details
router.get("/cartdetails", authenicate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        //console.log(buyuser + "user hain buy pr");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});

// get valid user

router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await USER.findOne({ _id: req.userID });
        console.log(buyuser + "user hain buy pr");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
});


//remove item from cart

router.delete("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
            return cruval.id != id;
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("iteam remove");

    } catch (error) {
        console.log(error + "error");
        res.status(400).json(req.rootUser);
    }
});


// for userlogout

router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("GoShopping", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});


module.exports = router;