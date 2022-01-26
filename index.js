const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config()
const port = process.env.PORT || 5000
const fileUpload = require('express-fileupload')

app.use(cors())
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xohwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("uniqueShop");
        const productsCollection = database.collection("products");
        const addCartCollection = database.collection("addcart");

        const reviewsCollection = database.collection("reviews");
        const usersCollection = database.collection('users');




        //POST API for  new products
        app.post("/products", async (req, res) => {
            const title = req.body.title;
            const Categories = req.body.Categories;
            const desc1 = req.body.desc1;
            const desc2 = req.body.desc2;
            const desc3 = req.body.desc3;
            const desc4 = req.body.desc4;
            const price = req.body.price;
            const image = req.files.image;

            const imageData = image.data;
            const encodedData = imageData.toString('base64')
            const imgBuffer = Buffer.from(encodedData, 'base64')
            const data = {
                title, desc3, desc4, price, desc1, desc2, Categories,
                image: imgBuffer
            }
            const result = await productsCollection.insertOne(data);
            res.json(result);
        })

        //GET API for all the products\ showing UI
        app.get("/products", async (req, res) => {
            const result = productsCollection.find({});
            const products = await result.toArray();
            res.send(products);

        })
        //Get API for certain product by id
        app.get("/products/:id", async (req, res) => {
            const productDetails = await productsCollection.findOne({ _id: ObjectId(req.params.id) });
            res.send(productDetails)

        });
        //Delete API- delete products
        app.delete('/products/:id', async (req, res) => {
            const deletedProducts = await productsCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedProducts)
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
        app.post('/orders', async (req, res) => {
            const orders = await ordersCollection.insertOne(req.body);
            res.json(orders);
        });

        //GET API-orders 
        app.get('/orders', async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders);
        });
        app.get("/orders/:email", async (req, res) => {
            const result = await ordersCollection.find({
                user_email: req.params.email,
            }).toArray();
            res.send(result);
        });
        //Delete API- delete order
        app.delete('/orders/:id', async (req, res) => {
            const deletedOrder = await ordersCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedOrder)
        });

        //Update order status api
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const updateStatus = req.body;
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: updateStatus
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result);

        });
        app.get("/wishlist", async (req, res) => {
            const result = wishlistCollection.find({});
            const wishlist = await result.toArray();
            res.send(wishlist);

        });
        app.get("/wishlist/:email", async (req, res) => {
            const result = await wishlistCollection.find({
                user_email: req.params.email,
            }).toArray();
            res.send(result);
        });

        //POST API for Products order
        app.post('/wishlist', async (req, res) => {
            const wishlist = await wishlistCollection.insertOne(req.body);
            res.json(wishlist);
        });
        app.delete('/wishlist/:id', async (req, res) => {
            const deletedwishlist = await wishlistCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedwishlist)
        });



        app.get("/addcart", async (req, res) => {
            const result = addCartCollection.find({});
            const addCart = await result.toArray();
            res.send(addCart);

        })
        //POST API for Products add to cart
        app.post('/addcart', async (req, res) => {
            const addCart = await addCartCollection.insertOne(req.body);
            res.json(addCart);
        });

        app.delete('/addcart/:id', async (req, res) => {
            const deletedaddcart = await addCartCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedaddcart)
        });

        app.get("/reviews", async (req, res) => {
            const result = reviewsCollection.find({});
            const reviews = await result.toArray();
            res.send(reviews);

        });

        //POST API for user review
        app.post('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.insertOne(req.body);
            res.json(reviews);
        });

        app.delete('/reviews/:id', async (req, res) => {
            const deletedreviews = await reviewsCollection.deleteOne({ _id: ObjectId(req.params.id) });
            res.json(deletedreviews)
        });





        //admin route
        //review g p
        //addtocart api p g d
        //wishlist api p g d



















    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('Co-op Battle Team 09!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})