const AWS = require("aws-sdk");
const uuid = require("uuid").v1;
const requireLogin = require("../middlewares/requireLogin");
const keys = require("../config/keys");

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyID,
  secretAccessKey: keys.secretAccessKey,
  region: "us-west-2",
});

// const s3 = new AWS.S3({
//   credentials: {
//     accessKeyId: keys.accessKeyID,
//     secretAccessKey: keys.secretAccessKey,
//   },
// });

module.exports = (app) => {
  app.get("/api/upload", requireLogin, (req, res) => {
    // generate a unique key for image upload
    const key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      "putObject",
      {
        Bucket: "myblogbucket3422",
        ContentType: "image/jpeg",
        Key: key,
      },
      (err, url) => {
        res.send({ key, url });
      }
    );
  });
};
