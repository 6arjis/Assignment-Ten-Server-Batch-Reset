const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const validateObjectId = (req, res, next) => {
  const id = req.params.id;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid equipment ID format" });
  }
  next();
};

app.get("/", (req, res) => {
  res.send("Sports Website Loading");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8g3c7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    // Get all equipment
    app.get("/equipment", async (req, res) => {
      try {
        const cursor = equipmentCollection.find();
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });

    // Get single equipment
    app.get("/equipment/:id", validateObjectId, async (req, res) => {
      try {
        const id = req.params.id;
        const result = await equipmentCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!result) {
          return res.status(404).json({ error: "Equipment not found" });
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });

    // app.get("/my-equipment", async (req, res) => {
    //   try {
    //     // Get user email from the authenticated user
    //     const userEmail = req.user.email; // You'll need to implement authentication middleware
    //     const query = { userEmail: userEmail };
    //     const result = await equipmentCollection.find(query).toArray();
    //     res.json(result);
    //   } catch (error) {
    //     res.status(500).json({ error: "Server error" });
    //   }
    // });

    // Create new equipment
    app.post("/equipment", async (req, res) => {
      try {
        // Add user email to the equipment data
        const newEquipment = {
          ...req.body,
          userEmail: req.user.email, // You'll need authentication middleware
          createdAt: new Date(),
        };

        const result = await equipmentCollection.insertOne(newEquipment);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: "Could not create equipment" });
      }
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Keep connection open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
