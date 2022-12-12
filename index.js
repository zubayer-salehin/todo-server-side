require("dotenv").config();
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 8000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5pmu7.mongodb.net/todo?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect the client to the server (optional starting in v4.7)
client.connect()
  .then((result) => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log("MongoDB not connected");
  });

const run = async () => {
  try {

    const db = client.db("todo");
    const usersInfoCollection = db.collection("usersInfo");
    const selectorCollection = db.collection("selectors");

    app.get("/selectors", async (req, res) => {
      const cursor = selectorCollection.find({});
      const selectors = await cursor.toArray();
      res.send(selectors);
    });

    app.get("/usersInfo", async (req, res) => {
      const cursor = usersInfoCollection.find({});
      const usersInfo = await cursor.toArray();
      res.send(usersInfo);
    });

    app.post("/userInfo", async (req, res) => {
      const newUserInfo = req.body;
      const name = await usersInfoCollection.findOne({ name: newUserInfo.name });
      if (!name) {
        const result = await usersInfoCollection.insertOne(newUserInfo);
        res.send(result);
      } else {
        res.send({ "message": "Name Already Exists" })
      }
    });

    app.patch("/userInfo/:id", async (req, res) => {
      const id = req.params.id;
      const updateUserInfo = req.body;
      const result = await usersInfoCollection.updateOne({ _id: ObjectId(id) }, { $set: updateUserInfo });
      res.send(result);
    });

    app.delete("/userInfo/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersInfoCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Welcome To User Information");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
