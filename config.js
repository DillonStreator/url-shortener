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
};
