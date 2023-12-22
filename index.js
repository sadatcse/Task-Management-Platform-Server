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

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      newUser.role = 'user';
      console.log(newUser);
      const existingUser = await userCollection.findOne({ email: newUser.email });
      if (existingUser) {console.log('user already');return res.status(200).send('Email already exists');}
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });


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

    app.patch('/users/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedUser = { ...req.body };
        delete updatedUser._id;
        if (Object.keys(updatedUser).length === 0) {return res.status(400).json({ error: 'No fields to update provided' });}
        const result = await userCollection.updateOne(filter, { $set: updatedUser });
        console.log('Update Result:', result); 
        if (result.matchedCount === 0) {return res.status(404).json({ error: 'User not found' });}
        if (result.modifiedCount === 1) {return res.json({ message: 'User updated successfully' });} 
        else {return res.status(500).json({ error: 'Failed to update user' });}} catch (error) {console.error('Server Error:', error); 
        return res.status(500).json({ error: 'Internal server error' });}
    });


    app.get('/tasks', async (req, res) => {
      const email = req.query.email;
      const query = { createemail: email };
      const result = await TaskCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      try {const result = await TaskCollection.findOne(filter);
        res.send(result);} catch (err) {res.status(500).send({ error: err.message });}
    });

    app.patch('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
    
      try {
        const existingTask = await TaskCollection.findOne(filter);
    
        if (!existingTask) {
          return res.status(404).send({ error: 'Task not found' });
        }
    
        const updatedFields = {};
        if (req.body.title) {
          updatedFields.title = req.body.title;
        }
        if (req.body.description) {
          updatedFields.description = req.body.description;
        }
        // Add more fields to update as needed
    
        // Update the existing task with the collected data
        const result = await TaskCollection.updateOne(filter, { $set: updatedFields });
    
        res.send({ message: 'Task updated successfully', result });
      } catch (err) {
        res.status(500).send({ error: err.message });
      }
    });

    app.post('/tasks', async (req, res) => {
      const item = req.body;
      const result = await TaskCollection.insertOne(item);
      res.send(result);
    });

    app.patch('/tasks/:status/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const status = req.params.status;
        const current = new Date();
        console.log(status);
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            status: status,
            updatedAt: current 
          }
        };
        const result = await TaskCollection.updateOne(filter, updatedDoc);
        res.send(result);
      } catch (err) {res.status(500).send(err.message);}
    });

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      try {const filter = { _id: new ObjectId(id) };
          const result = await TaskCollection.deleteOne(filter);
          if (result.deletedCount === 1) {res.status(200).json({ message: 'Task deleted successfully' });} 
          else {res.status(404).json({ message: 'Task not found' });}
      } catch (error) {console.error('Error deleting task:', error);res.status(500).json({ message: 'Internal server error' });}
    });


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



