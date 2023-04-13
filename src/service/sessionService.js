const Session = require("../models/sessionModel");
const { verifyJwt, signJwt } = require("../utils/jwt.utils");

const refreshAccessToken = async (refreshToken) => {
  const { decoded } = verifyJwt(refreshToken);

  if (!decoded || !get(decoded, "session")) return false;

  const session = await Session.findById(get(decoded, "session"));

  if (!session || !session.valid) return false;

  const user = await findUser({ _id: session.user });

  if (!user) return false;

  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: process.env.JWT_ACCESS_EXPIRES }
  );

  return accessToken;
};

module.exports = { refreshAccessToken };
