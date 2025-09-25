const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname,"data.json");

app.get("/api/data", (req, res) => {
  fs.readFile(DATA_FILE, "utf-8", (err, data) => {
    if (err) return res.status(500).send("Error al leer datos");
    res.send(data);
  });
});

app.post("/api/data", (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), "utf-8", err => {
    if (err) return res.status(500).send("Error al guardar datos");
    res.send({ status: "ok" });
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
