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

    //Update Post
    app.put("/equipment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedEquipment = req.body;
      const Equipment = {
        $set: {
          imageURL: updatedEquipment.imageURL,
          productName: updatedEquipment.productName,
          categoryName: updatedEquipment.categoryName,
          description: updatedEquipment.description,
          customDetails: updatedEquipment.customDetails,
          price: updatedEquipment.price,
          rating: updatedEquipment.rating,
          deliveryTime: updatedEquipment.deliveryTime,
          availability: updatedEquipment.availability,
        },
      };
      const result = await equipmentCollection.updateOne(
        query,
        Equipment,
        options
      );
      res.send(result);
    });
    //delete User
    app.delete("/equipment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await equipmentCollection.deleteOne(query);
      res.send(result);
    });

    // Create new equipment In The website
    app.post("/equipment", async (req, res) => {
      const newEquipment = req.body;

      const result = await equipmentCollection.insertOne(newEquipment);
      res.status(201).json(result);
    });

    console.log("Connected to MongoDB!");
  } finally {
    // Keep connection Open
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
