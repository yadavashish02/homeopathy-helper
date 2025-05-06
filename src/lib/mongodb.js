import { MongoClient } from 'mongodb';
import { DB_NAME, MONGODB_URI } from './config';

let client = null;
let clientPromise = null;

export async function connectToDb() {
  if (client) {
    return { client, db: client.db(DB_NAME) };
  }

  if (!clientPromise) {
    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }
    clientPromise = MongoClient.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }

  client = await clientPromise;

  return { client, db: client.db(DB_NAME) };
}
