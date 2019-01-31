const { MongoClient } = require('mongodb');
const env = require('../env.js');

const addPoi = (poi) => {
  const promise = new Promise(async (resolve, reject) => {
    const client = await MongoClient.connect(env.url, { useNewUrlParser: true });
    client.db(env.dbName).collection('poi').insertOne(poi, null, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
  return promise;
};

module.exports = addPoi;
