var MongoClient = require('mongodb').MongoClient;
var CategorySeeder = require('./CategorySeeder');
var GenreSeeder = require('./GenreSeeder');
var env = require('../../env.json');

require('dotenv').config();
const arguments = process.argv.slice(2);
var refresh = arguments.length && arguments[0] == "refresh" ? true :false;


const MONGODB_URI = env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const MONGODB_NAME = env.MONGODB_NAME || "diamond-verse";

const seeders = [
    CategorySeeder, 
    GenreSeeder
];

async function runSeeders() {
    let DB_URI = MONGODB_URI.slice(-1) === "/" ? MONGODB_URI.slice(0, -1) : MONGODB_URI;
    DB_URI = MONGODB_NAME.slice(0) == "/" ? `${DB_URI.trim()}/${MONGODB_NAME.slice(1)}` : `${DB_URI}/${MONGODB_NAME}`;
    const client = await MongoClient.connect(DB_URI, {});
    const db = client.db(MONGODB_NAME);
    if(refresh) {
        await db.dropDatabase();
    }
    for (let index = 0; index < seeders.length; index++) {
        await seeders[index](db);
    }
    await client.close();
}

runSeeders();
