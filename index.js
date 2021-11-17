const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yevl8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('watch');
        const productCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        // POST API
        app.post('/products', async (req, res) => {
          const product = req.body;
          // console.log('hit the post api', product);
          const result = await productCollection.insertOne(product);
          // console.log(result);
          res.json(result)
      });
        // GET API
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // GET Single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific product', id);
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.json(product);
        })
                // DELETE API
                app.delete('/products/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { _id: ObjectId(id) };
                  const result = await productCollection.deleteOne(query);
                  res.json(result);
              });

          //confirm orders
          app.post('/orders', async (req, res) =>{
                  const product = req.body;
                  // console.log('hit the post api', product);
                  const result = await ordersCollection.insertOne(product);
                  // console.log(result);
                  res.json(result)
          })


          //my confirmOrder
          app.get("/orders/:email", async (req, res)=>{
            const result = await ordersCollection.find({email: req.params.email}).toArray();
            res.send(result);
            // console.log(result)
          });
          // DELETE API
          app.delete('/orders/:email', async (req, res) => {
            const email = req.params.email;
            // console.log("Okkkkk",email )
            const query = { email: email };
            const result = await ordersCollection.deleteOne( query);
            res.json(result);
        });

         // POST review
         app.post('/reviews', async (req, res) => {
            const product = req.body;
            // console.log('hit the post api', product);
            const result = await reviewsCollection.insertOne(product);
            // console.log(result);
            res.json(result)
        });
        // GET review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const products = await cursor.toArray();
            // console.log(cursor);
            res.send(products);
        });
        // post users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });
        //put user for google signin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //check admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })
        //put user for admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateAdmin = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateAdmin);
            res.json(result);

        })


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Watch Server');
});

app.get('/hello', (req, res) => {
    res.send('hello updated here')
})

app.listen(port, () => {
    console.log('Running Watch Server on port', port);
})

