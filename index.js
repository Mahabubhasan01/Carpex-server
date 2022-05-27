const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

async function run(){
    try{
        await client.connect();
        const partsCollection = client.db('carpaex').collection('parts');
        const productsCollection = client.db('carpaex').collection('products');
        const engineCollection = client.db('carpaex').collection('engine');
        const oilCollection = client.db('carpaex').collection('oil');
        const tyersCollection = client.db('carpaex').collection('tyers');
        const reviewCollection = client.db('carpaex').collection('review')

        // only six parts collection 

        app.get('/parts',async(req,res)=>{
            const cursor = partsCollection.find({});
            const result =  await cursor.toArray()
            res.send(result)
        });

        // Get single item from partsCollection 
        app.get('/parts/:id',async(req,res)=>{
            const id = req.params.id;
            const query= {_id:ObjectId(id)}
            const result = await partsCollection.findOne(query);
            res.send(result);
        })


        // Get engine item 

        app.get('/engine',async(req,res)=>{
            const cursor = engineCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        });
        // Get oil item 

        app.get('/oil',async(req,res)=>{
            const cursor = oilCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        });
        // Get tyers item 

        app.get('/tyers',async(req,res)=>{
            const cursor = tyersCollection.find({});
            const result = await cursor.toArray();
            res.send(result)
        });

        // Post or add review 
        app.post('/review',async(req,res) =>{
            const data = req.body;
            const result = await reviewCollection.insertOne(data);
            res.send(result)
        })

        app.get('/',async(req,res)=>{
            console.log('test');
            req.send('ok done')
        })


        
    }
    finally{

    }
}



run().catch(console.dir);
app.listen(port,()=>console.log('Car parts exchange running at',port))

