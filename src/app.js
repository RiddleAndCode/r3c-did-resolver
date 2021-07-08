const http = require('http');
const did = require('did-resolver');

const { resolve } = require('./resolver');

async function didHandler (req, res) {
  let didUri = req.url.slice(1);
  let didObj = did.parse(didUri);
  res.setHeader("Content-Type", "application/json");
  if (didObj) {
    let didDoc = await resolve(didUri, didObj);
    res.writeHead(200);
    res.end(JSON.stringify(didDoc));
  } else {
    res.writeHead(400);
    res.end(JSON.stringify({error: "Bad request: Invalid DID"}));
  }
};

const server = http.createServer(didHandler);
server.listen(8080);
