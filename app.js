export default (express, bodyParser, createReadStream, crypto, http) => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,OPTIONS,DELETE"
    );
    next();
  });

  app.use((req, res, next) => {
    if (req.path.slice(-1) !== "/") {
      res.redirect(301, req.path + "/");
    } else {
      next();
    }
  });

  app.get("/login/", (req, res) => {
    res.send("matie_ball");
  });

  app.get("/code/", (req, res) => {
    const path = import.meta.url.substring(7);
    const stream = createReadStream(path);
    stream.pipe(res);
  });

  app.get("/sha1/:input/", (req, res) => {
    const hash = crypto
      .createHash("sha1")
      .update(req.params.input)
      .digest("hex");
    res.send(hash);
  });

  app.all("/req/", (req, res) => {
    const addr = req.method === "GET" ? req.query.addr : req.body.addr;
    if (!addr) {
      return res.status(400).send("No address provided");
    }
    http
      .get(addr, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });
        response.on("end", () => {
          res.send(data);
        });
      })
      .on("error", (err) => {
        res.status(500).send("Error fetching the URL");
      });
  });

  app.all("*", (req, res) => {
    res.send("matie_ball");
  });

  return app;
};
