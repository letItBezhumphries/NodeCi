const mongoose = require("mongoose");
// initialize redis client
const redis = require("redis");
const keys = require("../config/keys");
const client = redis.createClient(keys.redisUrl);
client.connect();

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
};


mongoose.Query.prototype.exec = async function () {

  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  
  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );
  
  const cachedValue = await client.hGet(this.hashKey, key);

  if (cachedValue) {
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc)
      ? doc.map((blogPost) => new this.model(blogPost))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);

  await client.hSet(this.hashKey, key, JSON.stringify(result));
  return result;
};

module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  },
};
