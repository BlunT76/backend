const MongoClient = require('mongodb').MongoClient;
const env = require('../env.js')

module.exports =  addPoi = (poi) => {
  let promise = new Promise(async (resolve, reject)=> {
    const client = await MongoClient.connect(env.url,{useNewUrlParser: true });
    client.db(env.dbName).collection("poi").insertOne(poi, null,(error, results) => {
    if (error) reject (error);
    resolve(results)
    });
  })
  return promise
}