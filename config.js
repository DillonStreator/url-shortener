const IS_PROD = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8080;

let BASE_URL = process.env.BASE_URL;
if (!BASE_URL && IS_PROD) {
  console.error("BASE_URL environment variable must be set in production");
  process.exit(1);
} else if (!BASE_URL) {
  BASE_URL = `http://localhost:${PORT}`;
}

module.exports = {
  PORT,
  IS_PROD,
  BASE_URL,
  MONGO_USERNAME: process.env.MONGO_USERNAME,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  MONGO_HOSTNAME: process.env.MONGO_HOSTNAME,
  MONGO_PORT: process.env.MONGO_PORT,
  MONGO_DB: process.env.MONGO_DB,
};
