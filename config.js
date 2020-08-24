module.exports = {
  PORT: process.env.PORT || 8081,
  IS_PROD: process.env.NODE_ENV === "production",
  BASE_URL: process.env.BASE_URL,
};
