const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
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

        app.get("/bill-list", async (req, res) => {
            const result = await billCollection.find().toArray();
            let total = 0;
            result.forEach((r) => (total = total + parseInt(r.amount)));
            // console.log(total);
            res.send({ result, total });
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
            // console.log(newUser.email);
            const email = req.body.email;
            // const name = req.body.name;
            // const password = par;
            const result = await userCollection.insertOne(newUser);
            const token = jwt.sign({ email: email }, process.env.WEB_TOKEN);
            console.log(token);
            res.send({ result, token });
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
        app.get("/bills/:email", async (req, res) => {
            const email = req.params.email;
            const user = await billCollection.findOne({ email: email });
            res.send(user);
        });
        app.put("/bills/:email", async (req, res) => {
            const email = req.params.email;
            const updateBill = req.body;
            const result = await billCollection.updateOne(
                { email: email },
                {
                    $set: updateBill,
                },
                { upsert: true }
            );
            res.send(result);
        });

        // GET DATA FROM CLIENT SIDE
        app.post("/bills", async (req, res) => {
            const newBill = req.body;
            // console.log(newBill);
            const result = await billCollection.insertOne(newBill);
            // console.log(result);
            if (result.acknowledged === true) {
                res.send({ status: "ok" });
            } else {
                res.send({ status: "fail" });
            }
            // res.send(result);
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
