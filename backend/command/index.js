var MongoClient = require('mongodb').MongoClient;
const user = require('./User');

require('dotenv').config();
const arguments = process.argv.slice(2);
let [type = "", address = ""] = arguments;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_NAME = process.env.MONGODB_NAME || "diamond-verse";

async function runCommands() {
    if(type && address) {
        let DB_URI = MONGODB_URI.slice(-1) === "/" ? MONGODB_URI.slice(0, -1) : MONGODB_URI;
        DB_URI = MONGODB_NAME.slice(0) == "/" ? `${DB_URI.trim()}/${MONGODB_NAME.slice(1)}` : `${DB_URI}/${MONGODB_NAME}`;
        const client = await MongoClient.connect(DB_URI, {});
        const db = client.db(MONGODB_NAME);
        if(type === "admin" || type === "artist") {
            await user(db, address, type);
        }
        await client.close();
    }
}

runCommands();
