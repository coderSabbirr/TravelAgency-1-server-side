const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
const port = process.env.PORT || 4000
const fileUpload = require('express-fileupload')

app.use(cors())
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://jasco_data:fJMiSq91GXthOxY6@cluster0.mvih6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("travel-agency");
        const blogsCollection = database.collection("blogs");

        const usersCollection = database.collection('users');
        const ordersCollection = database.collection("orders");



        //POST API for  new products
        app.post("/blogs", async (req, res) => {
            const title = req.body.title;
            const subtitle = req.body.subtitle;
            const dec = req.body.dec;
            const cost = req.body.cost;
            const Location = req.body.Location;
            const category = req.body.category;
            const rating = req.body.rating;
            const status = req.body.status;
            const useremail = req.body.useremail;
            const image = req.files.image;
            const imageData = image.data;
            const encodedData = imageData.toString('base64')
            const imgBuffer = Buffer.from(encodedData, 'base64')
            const data = {
                title, subtitle, dec, category, image, cost, Location, status, rating, useremail,
                image: imgBuffer
            }
            const result = await blogsCollection.insertOne(data);
            res.json(result);
        })

        app.put('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const title = req.body.title;
            const subtitle = req.body.subtitle;
            const dec = req.body.dec;
            const cost = req.body.cost;
            const Location = req.body.Location;
            const category = req.body.category;
            const rating = req.body.rating;
            const username = req.body.username;
            const image = req.files.image;
            const imageData = image.data;
            const encodedData = imageData.toString('base64')
            const imgBuffer = Buffer.from(encodedData, 'base64')
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    title: title,
                    subtitle: subtitle,
                    dec: dec,
                    cost: cost,
                    Location: Location,
                    category: category,
                    rating: rating,
                    username: username,
                    image: imgBuffer
                }
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        app.put('/status/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const status = req.body.status;
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: status
                }
            };
            const result = await blogsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //GET API for all the products\ showing UI
        app.get("/blogs", async (req, res) => {
            const cursor = blogsCollection.find({});
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            let blogs;
            const count = await cursor.count();
            if (page) {
                blogs = await cursor.skip(page * size).limit(10).toArray();
            }
            else {
                blogs = await cursor.limit(10).toArray();
            }
         
            
            res.send({
                count,
                blogs
            });

        })
        // app.get("/blogs/:status", async (req, res) => {
        //     console.log(req.query)
        //     const page=parseInt(req.query.page)
        //     const size=parseInt(req.query.size)
        //     const cursor = await blogsCollection.find({
        //         status: req.params.status,
        //     })
        //     let blogs;
        //     const count=await cursor.count();
        //     if(page){
        //         blogs= await cursor.skip(page*size).limit(size).toArray()
        //     }
        //     else{
        //         blogs = await blogsCollection.find({
        //             status: req.params.status,
        //         }).toArray();
        //     }




        //     res.send({count,blogs});
        // });

        app.get("/myblogs/:email", async (req, res) => {
            const result = await blogsCollection.find({
                useremail: req.params.email,
            }).toArray();
            res.send(result);
        });
        app.get("/manageblog", async (req, res) => {
            const result = await blogsCollection.find({}).toArray();
            res.send(result);
        });
        //Get API for certain product by id
        app.get("/blogsview/:id", async (req, res) => {
            const blogs = await blogsCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(blogs)
        });
        //Delete API- delete products
        app.delete('/blogs/:id', async (req, res) => {
            const blogsDelete = await blogsCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(blogsDelete)
        });

        //POST API- all users siging with email
        app.post('/users', async (req, res) => {
            const users = await usersCollection.insertOne(req.body);
            res.json(users);
        });

        //PUT API -user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        //Update user role 
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

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

        //POST API for Products order


        //GET API-orders 


        //Delete API- delete order
        app.delete('/orders/:id', async (req, res) => {
            const deletedOrder = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedOrder)
        });

        //Update order status api

        app.get("/wishlist/:email", async (req, res) => {
            const result = await wishlistCollection.find({
                user_email: req.params.email,
            }).toArray();
            res.send(result);
        });








    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('Hacking Done')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})