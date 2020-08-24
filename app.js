const express = require("express");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const helmet = require("helmet");

const config = require("./config");
const { IS_PROD, PORT } = config;
let { BASE_URL } = config;
if (!BASE_URL && IS_PROD) {
  console.error(
    "BASE_URL environment variable must be set"
  );
  process.exit(1);
} else if (!BASE_URL) {
  BASE_URL = `http://localhost:${PORT}`;
}

const app = express();
app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return next();
};

const slugs = {};
const urls = {};

app.get("/:slug", (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slugs[slug]) return res.sendStatus(404);

    res.redirect(slugs[slug].url);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/urls",
  [body("url").isURL(), body("slug").isSlug().optional()],
  validate,
  (req, res, next) => {
    try {
      const { url, slug = nanoid(8) } = req.body;

      if (slugs[slug]) {
        return res.status(409).json({ message: "slug in use", data: slugs[slug] });
      }
      if (urls[url]) {
        return res.status(409).json({
          message: "url has been shortened already",
          data: urls[url],
        });
      }

      const obj = { url, slug, shortened: `${BASE_URL}/${slug}` };
      slugs[slug] = obj;
      urls[url] = obj;
      res.status(201).json(obj);
    } catch (error) {
      next(error);
    }
  }
);

app.use((error, req, res, next) => {
  return res.status(500).json({
    message: error.message,
    stack: IS_PROD ? undefined : error.stack,
  });
});

module.exports = app;
