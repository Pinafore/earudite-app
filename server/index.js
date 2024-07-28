const express = require("express");
const path = require("path");
var proxy = require("express-http-proxy");

const PORT = 6960;

const app = express();

app.use(express.static("build"));

app.use(
  "/api/dataflow/*",
  proxy("localhost:5211", {
    proxyReqPathResolver: function (req) {
      return req.path.replace("/api/dataflow", "");
    },
    proxyErrorHandler: function (err, res, next) {
      console.log(err);
      switch (err && err.code) {
        case "ECONNRESET": {
          return res.status(405).send("504 became 405");
        }
        case "ECONNREFUSED": {
          return res.status(200).send("gotcher back");
        }
        default: {
          next(err);
        }
      }
    },
  })
);
app.use(
  "/api/hls/*",
  proxy("localhost:4541", {
    proxyReqPathResolver: function (req) {
      return req.path.replace("/api/hls", "");
    },
    proxyErrorHandler: function (err, res, next) {
      console.log(err);
      switch (err && err.code) {
        case "ECONNRESET": {
          return res.status(405).send("504 became 405");
        }
        case "ECONNREFUSED": {
          return res.status(200).send("gotcher back");
        }
        default: {
          next(err);
        }
      }
    },
  })
);

app.use(
  "/api/socket/*",
  proxy("127.0.0.1:6571", {
    proxyReqPathResolver: function (req) {
      return req.path.replace("/api/dataflow", "");
    },
    proxyErrorHandler: function (err, res, next) {
      console.log(err);
      switch (err && err.code) {
        case "ECONNRESET": {
          return res.status(405).send("504 became 405");
        }
        case "ECONNREFUSED": {
          return res.status(200).send("gotcher back");
        }
        default: {
          next(err);
        }
      }
    },
  })
);

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./build/index.html"), (err) => {
    if (err) res.status(500).send(err);
  });
});

app.listen(PORT, "0.0.0.0", (_) => console.log("listening on ", PORT));

