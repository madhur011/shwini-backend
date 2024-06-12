const { response } = require("./response");

module.exports = () => {
  return (req, res, next) => {
    const token = req.body.key || req.query.key || req.headers.key;
    if (token) {
      if (token == process.env.SECRET_KEY) {
        next();
      } else {
        return response(res, 401, { error: "Unauthorized access" })
      }
    } else {
      return response(res, 401, { error: "Unauthorized access" })
    }
  };
};
