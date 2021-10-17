import { app } from "./function/express.js";
import mongodb from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.uri;
const { MongoClient } = mongodb;
const client = MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + process.env.PORT);
});

export { client };
// global variables

// import bot from "../index";
