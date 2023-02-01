const Buffer = require("safe-buffer").Buffer;
const Keygrip = require("keygrip");
const keys = require("../../config/keys");
const keygrip = new Keygrip([keys.cookieKey]);

// now passing into the sessionFactory the user model from mongoose

module.exports = (user) => {
  const sessionObject = {
    passport: {
      // remember the _id is actually a javascript object and not a string
      user: user._id.toString(),
    },
  };

  // turn the session object into a string
  const session = Buffer.from(JSON.stringify(sessionObject)).toString("base64");

  // take the keygrip instance and the session and sign the session to generate the signature
  const sig = keygrip.sign("session=" + session);

  return {
    session,
    sig,
  };
};
