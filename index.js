const express = require('express');
const cors = require('cors');

require("./db/config")
const User = require("./db/User")
const Product = require('./db/Product');

const jwt = require('jsonwebtoken')
const jwtKey = 'e-comm'

const app = express();
app.use(express.json());
app.use(cors());

app.post("/register", async (req,res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    jwt.sign({ result }, jwtKey, {expiresIn: "2h"}, (err,token) => {
        if(err){
            res.send({result : "Something went wrong"})
        }
        res.send( {result, auth:token})
    })
    // res.send(result);
    // res.send("Api in Progress")
    // res.send(req.body)
})

app.post('/login',async (req,res) => {
    console.log(req.body)
    if(req.body.password && req.body.email){
        let user = await User.findOne(req.body).select("-password");
        if(user)
        {
            jwt.sign({ user }, jwtKey, {expiresIn: "24h"}, (err,token) => {
                if(err){
                    res.send({result : "Something went wrong"})
                }
                res.send( {user, auth:token})
            })
        //  res.send(user)
        }else{
         res.send({result:"No User Found"})
        }
    }else{
        res.send({result:"No User Found"})
    }
     })
    
     app.post("/add-product",verifyToken, async(req,res) => {
        let product = new Product(req.body);
        let result = await product.save();
        res.send(result);
     });

     app.get("/products", verifyToken, async (req, resp) => {
        const products = await Product.find();
        if (products.length > 0) {
            resp.send(products)
        } else {
            resp.send({ result: "No Product found" })
        }
    });

    app.delete("/product/:id", verifyToken, async (req, resp) => {
        let result = await Product.deleteOne({ _id: req.params.id });
        resp.send(result)
    }),

    app.get("/product/:id", verifyToken, async (req, resp) => {
        let result = await Product.findOne({ _id: req.params.id })
        if (result) {
            resp.send(result)
        } else {
            resp.send({ "result": "No Record Found." })
        }
    });

    app.put("/product/:id", verifyToken, async (req, resp) => {
        let result = await Product.updateOne(
            { _id: req.params.id },
            { $set: req.body }
        )
        resp.send(result)
    });

    app.get("/search/:key", verifyToken, async (req, resp) => {
        let result = await Product.find({
            "$or": [
                {
                    name: { $regex: req.params.key }  
                },
                {
                    company: { $regex: req.params.key }
                },
                {
                    category: { $regex: req.params.key }
                }
            ]
        });
        resp.send(result);
    });

    function verifyToken(req, res, next){
        let token = req.headers['authorization'];
        if(token){
            token = token.split(' ')[1]
            console.log("middleware called", token)
            jwt.verify(token, jwtKey, (err, valid) => {
                if(err){
                    res.status(401).send({result : "Please provide valid token"})
                }else{
                    next();
                }
            })
        }else{
            res.status(403).send({result : "Please add token with header"})
        }
        
        
    }

app.listen(5000);





























// const connectDB = async () => {
//     mongoose.connect("mongodb://localhost:27017/e-comm");
//     const productSchema = new mongoose.schema({});
//     const product = mongoose.model("product", productSchema);
//     const data = await product.find();
//     console.log(data);
// }

// connectDB();

// app.get("/", (req, res) => {
//     res.send("App is working...")
// });