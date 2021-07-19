const express = require("express");
var bodyParser = require('body-parser')
const EthUtil = require('ethereumjs-util')
var cors = require("cors");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors());

const port = 3030;

function getRecoveredAddress(message, signature, address) {
  //get the Keccak hash of the message. 
  const hashedMessage = EthUtil.keccak(message)

  //Use the ecrecover, to derive the public key from the signature. 
  const publicKey = EthUtil.ecrecover(hashedMessage, signature.v, EthUtil.toBuffer(signature.r.data), EthUtil.toBuffer(signature.s.data))
  
  //Calculate the address of the signer from the public key. 
  const recoverdAddress = EthUtil.bufferToHex(EthUtil.pubToAddress(publicKey))

  return recoverdAddress;
}

// parse application/x-www-form-urlencoded
app.get("/token", (req, res) => {
  let nonce = Math.floor(Math.random() * 1000000).toString(); // in a real life scenario we would random this after each login and fetch it from the db as well
  return res.send(nonce);
});

app.post("/auth", (req, res) => {
  const { address, signature, nonce } = req.body;

  // convert nonce(token) to buffer.
  var message = Buffer.from(nonce, 'utf-8');
  
  // get recovered address from signature.
  const recoveredAddress = getRecoveredAddress(message, signature, address)
  
  //compares the address. 
  if (EthUtil.toChecksumAddress(address) != EthUtil.toChecksumAddress(recoveredAddress)) {
      return res.status(401).send();
  }

  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
