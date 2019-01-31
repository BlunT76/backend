const { MongoClient } = require('mongodb');
const MongoObjectID = require('mongodb').ObjectID;
const env = require('../env.js');


const deletePoi = (id) => {
  const promise = new Promise(async (resolve, reject) => {
    const objToFind = {
      _id: new MongoObjectID(id),
    };
    const client = await MongoClient.connect(env.url, { useNewUrlParser: true });
    client.db(env.dbName).collection('poi').deleteOne(objToFind, null, (error, result) => {
      if (error) reject(error);
      resolve(result);
    });
  });

  return promise;
};

module.exports = deletePoi;
