const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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

        // GET TOTAL BILL
        app.get("/billsCount", async (req, res) => {
            const count = await billCollection.countDocuments();
            res.send({ count });
        });

        //LOAD DATA USE QUERY
        app.get("/bills", async (req, res) => {
            const query = {};
        });

        // GET DATA FROM CLIENT SIDE
        app.post("/bills", async (req, res) => {
            const newBill = req.body;
            console.log(newBill);
            const result = await billCollection.insertOne(newBill);
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
