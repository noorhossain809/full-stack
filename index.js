const express = require('express')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();


app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vjh6y.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const itemCollection = client.db("products").collection("items");
  const checkingCollection = client.db("products").collection("checking");
  
  app.get('/items', (req, res) => {
    itemCollection.find()
    .toArray((err, events) => {
      res.send(events)
    })
  })

  app.get('/item/:id', (req, res) => {
    const id = ObjectID(req.params.id)
    itemCollection.find({_id: id})
    .toArray((err, events) => {
     res.send(events[0])
    })
  })

  app.post('/addEvent', (req, res) => {
      const newEvent = req.body;
      console.log('adding new event', newEvent)
      itemCollection.insertOne(newEvent)
      .then(result => {
          console.log('inserted count', result.insertedCount)
          res.send(result.insertedCount > 0)
      })
  })

  app.post('/newChecking', (req, res) => {
    const newChecking = req.body;
   checkingCollection.insertOne(newChecking)
   .then(result => {
     res.send(result.insertedCount > 0);
   })
  
  })

  app.get('/bookings', (req, res) => {
    checkingCollection.find({email: req.query.email})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.delete('/deleteEvent/:id', (req, res) => {
    checkingCollection.deleteOne({_id: req.params.id})
    .then( (result) => {
      console.log(result)
    })

  })
});


app.listen(process.env.PORT || 5001)