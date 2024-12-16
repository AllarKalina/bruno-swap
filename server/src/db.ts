import { MongoClient } from "mongodb";

const { MONGO_URI } = process.env;

export const client = new MongoClient(MONGO_URI);
try {
  await client.connect();
} catch (e) {
  console.log(e);
}
export const db = client.db();
