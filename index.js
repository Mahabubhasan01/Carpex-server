const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middle ware
app.use(cors());
app.use(express.json());

// Json web token -------------------------------------------
const verifyJWT =(req,res,next)=>{
    const header = req.headers.authorization
    if(!header){
        res.status(403).send({message:'Unauthorized'})
    };
    const token = header.split(' ')[1];
    jwt.verify(token,process.env.TOKEN,function(err,decoded){
        if(err){
            res.status(403).send({message:'Forbidden'})
        };
        res.decoded=decoded;
        next();
    })
}
/* ---------------------------------------------------------- */




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3kfh0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




run().catch(console.dir);
app.listen(port,()=>console.log('Car parts exchange running at',port))

