const mongoose = require("mongoose");
// initialize redis client
const redis = require("redis");
const keys = require("../config/keys");
const client = redis.createClient(keys.redisUrl);
client.connect();

// going to overwrite the Query.exec function that is defined on a Mongoose query and
// figure out how to manipulate code to execute extra code
// storing the original exec function from lib
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  // if cache is ever called it will set this.useCache boolean flag to true on the query
  this.useCache = true;

  // create property hashKey to target nested cache that we want
  this.hashKey = JSON.stringify(options.key || "");

  // ** Important in order to make sure that this function is chainable along with the other query functions you need to return this
  return this;
};

// highjacking mongoose Query class exec function
// Notice we don't want to assign it equal to an arrow function that would loose the this assignment
mongoose.Query.prototype.exec = async function () {
  // console.log("Im about to run a Query");

  // check to see if the useCache property has not been set to true in which case we just run the original exec funtion
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // console.log(this.getQuery());
  // still need to be able to make query unique to the collection its working on
  // the below logs the collection name
  // console.log(this.mongooseCollection.name); // returned blogs

  // use Object.assign to copy over all the class properties from the query
  // and add the collection name to the final object as a way to distingush
  // and create unique keys pertaining to correct collection
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // console.log(key);

  // Do we have a value for key in redis
  // grab the key/value from redis
  // const cachedValue = await client.get(key);
  const cachedValue = await client.hGet(this.hashKey, key);

  // if we do return that
  if (cachedValue) {
    // this is the base model class
    // console.log(this);
    // mongoose needs to return documents so instantiate new document
    // needed to handle case where we have multiple records in an array or or just one
    // first parse the cachedValue from cache
    const doc = JSON.parse(cachedValue);

    // use ternary to check whether redis cache is an array or just a simple object
    // if its an array will need to iterate over each and instantiate a new model instance for each object
    return Array.isArray(doc)
      ? doc.map((blogPost) => new this.model(blogPost))
      : new this.model(doc);
  }
  // otherwise, execute the query against mongodb and store the result in cache
  // store the result of executing the query
  const result = await exec.apply(this, arguments);

  // console.log("result:", result);

  // need to make sure to turn result into JSON before handing off to redis
  // await client.set(key, JSON.stringify(result));
  await client.hSet(this.hashKey, key, JSON.stringify(result));
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
