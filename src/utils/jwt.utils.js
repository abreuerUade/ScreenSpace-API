const jwt = require("jsonwebtoken");

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

const signJwt = (object, options) => {
  return jwt.sign(object, privateKey, {
    algorithm: "RS256",
  });
};

const verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, publicKey);

    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e) {
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
};

module.exports = { verifyJwt, signJwt };
