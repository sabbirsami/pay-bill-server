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
        console.log("Here");

        app.get("/bills", async (req, res) => {
            const result = await billCollection.find().toArray();
            res.send(result);
        });

        app.get("/billsCount", async (req, res) => {
            const count = await billCollection.find().count();
            res.send({ count });
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
