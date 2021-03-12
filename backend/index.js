const express = require("express");
const app = express();
const port = 3000;

app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString(); // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce);
});
app.post("/auth", (req, res) => {
  const { address, signature, nonce } = req.body;

  // TODO: Validate signature by using eth tools (tip: ethereumjs-util and eth-sig-util)

  const recoveredAddress = "the_address_recovered_from_the_signature";

  if (recoveredAddress !== address) {
    return res.status(401).send();
  }

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
