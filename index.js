const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sports Website Loading");
});
const username = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${username}:${pass}@cluster0.8g3c7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const equipmentCollection = client
      .db("equipmentDB")
      .collection("equipment");

    //View All The Data Stored In the Database
    app.get("/equipment", async (req, res) => {
      const cursor = equipmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    //Create New Equipment and Store In The Database Request
    app.post("/equipment", async (req, res) => {
      const newEquipment = req.body;
      console.log(newEquipment);
      const result = await equipmentCollection.insertOne(newEquipment);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Sports Website Server is running `);
});
//
//
