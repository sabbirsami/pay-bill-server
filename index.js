const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.up3hj.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const billCollection = client.db("payBill").collection("bills");
        const userCollection = client.db("payBill").collection("registration");

        // GET ALL BILL FROM DATABASE
        app.get("/bills", async (req, res) => {
            const query = {};
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const cursor = billCollection.find(query);
            const result = await cursor
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send(result);
        });
        app.get("/bills", async (req, res) => {
            const result = await billCollection.find().toArray();
            res.send(result);
        });

        // GET TOTAL BILL
        app.get("/billsCount", async (req, res) => {
            const count = await billCollection.countDocuments();
            res.send({ count });
        });

        //LOAD REGISTRATION DATA
        app.get("/registration", async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        });

        app.post("/registration", async (req, res) => {
            const newUser = req.body;
            console.log(newUser);
            // const name = req.body.name;
            // const email = req.body.email;
            // const password = par;
            const result = await userCollection.insertOne(newUser);
            res.send(result);
        });

        app.get("/registration", async (req, res) => {
            const query = req.body;
            console.log(query);
            const result = await userCollection.find(query).toArray();
            res.send(result);
        });

        app.get("/registration/:email", async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            res.send(user);
        });

        // GET DATA FROM CLIENT SIDE
        app.post("/bills", async (req, res) => {
            const newBill = req.body;
            console.log(newBill);
            const result = await billCollection.insertOne(newBill);
            res.send(result);
        });
        app.get("/bills/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await billCollection.findOne(query);
            res.send(result);
        });

        // DELETE BILL BY ID
        app.delete("/bills/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await billCollection.deleteOne(query);
            console.log(id);
            res.send(result);
        });
    } finally {
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Pay Bill");
});
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
