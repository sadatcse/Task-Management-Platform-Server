const express = require('express');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@server0.emasglv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const userCollection = client.db('Task').collection('User');
    const TaskCollection = client.db('Task').collection('Parcel');


    app.get('/users', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const user = await userCollection.findOne({ email: email });

      if (user) {

        res.send(user);
      } else {
        res.status(404).send('User not found');
      }
    });

    app.get('/tasks', async (req, res) => {
      const cursor = TaskCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    app.post('/users', async (req, res) => {
      const newUser = req.body;
      newUser.role = 'user';
      console.log(newUser);
      const existingUser = await userCollection.findOne({ email: newUser.email });
      if (existingUser) {console.log('user already');return res.status(200).send('Email already exists');}
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });



    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })






    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Tasks Server is running')
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})



