const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
console.log(process.env.DB_PASS);
console.log(process.env.DB_USER);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3pfigzq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const jobCollection = client.db("jobsHub").collection("allJobs");
    const applicationCollection = client.db("jobsHub").collection("apply");

    app.get("/allJobs", async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/allJobs/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = {
        $set: {
          jobTitle: data.jobTitle,
          logo: data.logo,
          username: data.username,
          salaryRange: data.salaryRange,
          category: data.category,
          description: data.description,
          picture: data.picture,
          jobApplicatsNumber: data.jobApplicatsNumber,
          jobPostingDate: data.jobPostingDate,
          deadline: data.deadline,
        },
      };
      const result = await jobCollection.updateOne(
        filter,
        updatedItem,
        options
      );
      res.send(result);
    });

    app.get("/allJobs/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = {
          email: email,
        };
        const result = await jobCollection.find(query).toArray();
        console.log(result);
        if (!result) {
          res.status(404).send("Item not found");
          return;
        }
        res.send(result);
      } catch {
        console.error("Error:");
        res.status(500).send("Internal Server Error");
      }
    });

    app.post("/allJobs", async (req, res) => {
      const job = req.body;
      console.log(job);
      const result = await jobCollection.insertOne(job);
      res.send(result);
    });

    app.get("/apply", async (req, res) => {
      const cursor = applicationCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/apply", async (req, res) => {
      const apply = req.body;
      console.log(apply);
      const result = await applicationCollection.insertOne(apply);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("jobsHub is running");
});

app.listen(port, () => {
  console.log(`jobsHub server is running on port ${port}`);
});
