const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middle ware
app.use(cors());
app.use(express.json());

// Json web token -------------------------------------------
const verifyJWT = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    res.status(403).send({ message: "Unauthorized" });
  }
  const token = header.split(" ")[1];
  jwt.verify(token, process.env.TOKEN, function (err, decoded) {
    if (err) {
      res.status(403).send({ message: "Forbidden" });
    }
    res.decoded = decoded;
    next();
  });
};
/* ---------------------------------------------------------- */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3kfh0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const partsCollection = client.db("carpaex").collection("parts");
    const productsCollection = client.db("carpaex").collection("products");
    const engineCollection = client.db("carpaex").collection("engine");
    const oilCollection = client.db("carpaex").collection("oil");
    const tyersCollection = client.db("carpaex").collection("tyers");
    const reviewCollection = client.db("carpaex").collection("reviews");
    const ordersCollection = client.db("carpaex").collection("orders");
    const userCollection = client.db("carpaex").collection("users");

    // only six parts collection

    app.get("/parts", async (req, res) => {
      const cursor = partsCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get single item from partsCollection
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await partsCollection.findOne(query);
      res.send(result);
    });
    // delete parts item by admin
    app.delete("/parts/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user.role === "admin") {
        const result = await partsCollection.deleteOne(query);
        res.send(result);
      }
    });
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const data = req.body;
      const filter = {email:email}
      const options = {upsert:true}
      const updateDoc={
        $set:data
      }
      const result = await userCollection.updateOne(filter,options,updateDoc);
      const token = jwt.sign({email:email},process.env.TOKEN);
      
      res.send({result,token});
    });

    // Get engine item

    app.get("/engine", async (req, res) => {
      const cursor = engineCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // Get oil item

    app.get("/oil", async (req, res) => {
      const cursor = oilCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    // Get tyers item

    app.get("/tyers", verifyJWT, async (req, res) => {
      const cursor = tyersCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // Post or add review
    app.post("/review", async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data);
      res.send(result);
    });
    app.post("/parts", async (req, res) => {
      const data = req.body;
      const result = await partsCollection.insertOne(data);
      res.send(result);
    });
    // get review by params as a email
    app.get("/review/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    // add order by single user
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      res.send(result);
    });
    // get orders admin or current user
    app.get("/order/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/user/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/review/:email", async (req, res) => {
      const userEmail = req.params.email;
      const query = { email: userEmail };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    app.delete('/order/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const deleteProduct = await ordersCollection.deleteOne(query);
      res.send(deleteProduct);
    })

    
    app.delete('/parts/:id',async(req,res) =>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const deleteProduct = await partsCollection.deleteOne(query);
      res.send(deleteProduct);
    })
    app.get('/order',async(req,res)=>{
      const cursor = ordersCollection.find({});
      const result = await cursor.toArray();
      res.send(result)
    });
    // get user 

    
    app.get('/user',async(req,res)=>{
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.send(result)
    });
    app.get('/review',async(req,res)=>{
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.send(result)
    });

    app.get("/", async (req, res) => {
      console.log("test");
      req.send("ok done");
    });
  } finally {
  }
}

run().catch(console.dir);
app.listen(port, () => console.log("Car parts exchange running at", port));
