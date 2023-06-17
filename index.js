const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.03ostmu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {

    const usersCollection = client.db('draw-verse').collection('users')
    const allClassesCollection = client.db('draw-verse').collection('allclasses')


    // put user data in database
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const updateDoc = {
        $set: user,
      }
      const result = await usersCollection.updateOne(query, updateDoc, options)
      res.send(result)
    })



    // find specific user
    app.get("/users/", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })


    // update the user's role to admin by admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })



    // update the user's role to instructor by admin
    app.patch('/users/instructor/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          role: 'instructor'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    
    // update the status by admin
    app.patch("/allclasses/:id", async (req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          status: 'approved'
        }
      }
      const result = await allClassesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


     // update the status by admin to deny
     app.patch("/allclasses/deny/:id", async (req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          status: 'denied'
        }
      }
      const result = await allClassesCollection.updateOne(filter, updateDoc)
      res.send(result)
    })


    // post classes to server by instructor
    app.post('/allclasses', async(req, res) =>{
      const allclasses = req.body;
      // console.log(allclasses)
      const result = await allClassesCollection.insertOne(allclasses)
      res.send(result)
    })


    // find all classes that all the instructors added
    app.get('/allclasses', async (req, res) =>{
      const allclasses = req.body;
      const result = await allClassesCollection.find().toArray();
      res.send(result)
    })


    // find the classes that instructor (only his) added
    app.get('/myclasses', async (req, res) =>{
      let query = {}
      if(req.query?.userEmail){
        query = {userEmail: req.query.userEmail}
      }
      const result = await allClassesCollection.find(query).toArray()
      res.send(result)
    })


    // find all the instructor
    app.get("/instructor/", async (req, res) => {
      let query = {};
      if (req.query?.role) {
        query = {role: req.query.role }
      }
      const result = await usersCollection.find(query).toArray();
      res.send(result)
    })

  
    // find all the approved classes
    app.get("/classes/", async (req, res) => {
      let query ={};
      if(req.query?.status){
        query = {status: req.query.status}
      }
      const result = await allClassesCollection.find(query).toArray();
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('AirCNC Server is running..')
})

app.listen(port, () => {
  console.log(`AirCNC is running on port ${port}`)
})

module.exports = app;