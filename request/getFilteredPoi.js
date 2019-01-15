const MongoClient = require('mongodb').MongoClient;
const env = require('../env.js')

module.exports =  getFilteredPoi = (lat,lng,dist) => {
  let promise = new Promise(async (resolve, reject)=> {
    const client = await MongoClient.connect(env.url,{useNewUrlParser: true });
    client.db(env.dbName).collection("poi").find(
      {	"loc":
        {	"$near":
          { "$geometry":
            { "type": "Point",
              "coordinates": [Number(lng), Number(lat)] 
            },
            "$maxDistance": Number(dist)
          },
        }	
      }
    )
    .toArray((error, results) => {
      if (error) reject (error);
      client.close();
      resolve(results);
    })
  })
  return promise
}