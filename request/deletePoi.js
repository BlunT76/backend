const MongoClient = require('mongodb').MongoClient;
const MongoObjectID = require("mongodb").ObjectID;
const env = require('../env.js')


module.exports =  deletePoi = (id) => {
  let promise = new Promise(async (resolve, reject)=> {
    let objToFind = {
      _id: new MongoObjectID(id)
    };
    const client = await MongoClient.connect(env.url,{useNewUrlParser: true });
    client.db(env.dbName).collection("poi").deleteOne(objToFind, null, (error, result) => {
    if (error) reject (error);
    resolve(result)
    });
  })

  return promise
}