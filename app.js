const express = require("express");
const bodyParser = require("body-parser");
const { body, validationResult } = require("express-validator");
const { nanoid } = require("nanoid");
const helmet = require("helmet");

const {
  IS_PROD,
  BASE_URL,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOSTNAME,
  MONGO_PORT,
  MONGO_DB,
} = require("./config");

const MONGO_URI = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

const db = require("monk")(MONGO_URI);

const urls = db.create("urls");
urls.createIndex("url slug");

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

app.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    const url = await urls.findOne({ slug });
    if (!url) return res.sendStatus(404);

    res.redirect(url.url);
  } catch (error) {
    next(error);
  }
});

app.post(
  "/urls",
  [body("url").isURL(), body("slug").isSlug().optional()],
  validate,
  async (req, res, next) => {
    try {
      const { url, slug = nanoid(8) } = req.body;

      const existingSlug = await urls.findOne({ slug });
      if (existingSlug) {
        return res
          .status(409)
          .json({ message: "slug in use", data: existingSlug });
      }
      const existingUrl = await urls.findOne({ url });
      if (existingUrl) {
        return res.status(409).json({
          message: "url has been shortened already",
          data: existingUrl,
        });
      }

      const obj = { url, slug, shortened: `${BASE_URL}/${slug}` };
      await urls.insert(obj);
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
