// TODO Fill&fix jsDoc comments
const config = require('./config');
const did = require('did-resolver');
const http = require('http');

/**
 * Fetch http request body.
 * @param {string | ?} options - URL or http options.
 */
function getBody(options) {
  return new Promise(function(resolve, reject) {
    var req = http.request(options, (res) => {
      if (res.statusCode != 200) {
        reject(new Error(`Request failed: ${res.statusCode}`));
      }
      var body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve(body);
      });
    });
    req.on('error', (err) => {
      reject(err);
    });
    req.end();
  });
}

/**
 * Fetch transaction from R3C endpoint
 * @param {string} id - Transaction id
 * @return {?}
 */
async function fetchTx (id) {
  // TODO catch error
  return JSON.parse(await getBody(`${config.R3C_TX_ENDPOINT}/${id}`));
}

/**
 * Construct DidDocument from fetched R3C transaction.
 * @constructor
 * @param {ParsedDid} parsedDid
 * @return {DidDocument}
 */
async function getDidDocument(parsedDid) {
  let tx = await fetchTx(parsedDid.id);

  if (tx.inputs.length != 1
      || tx.inputs[0].owners_before.length != 1) {
    throw new Error('Only single input transactions with one owner \
are allowed');
  }
  if (tx.outputs.length != 1
      || tx.outputs[0].condition.details.type != 'ed25519-sha-256') {
    throw new Error('Only single output transactions of \
ed25519-sha-256 type are allowed');
  }

  // NOTE publicKeyMultibase encodes base encoding types with leading
  // char. In our case base58 encoding denoted by 'z'
  // more here: https://github.com/multiformats/multibase/blob/master/multibase.csv
  let verificationMethod = [{
    id: `${parsedDid.did}#input-0`,
    type: 'Ed25519VerificationKey2020',
    controller: `${parsedDid.did}#output-0`,
    //                            ^^^^^^^^
    // assuming here that contrloller here is an output controller,
    // same goes for output-0
    publicKeyMultibase: `z${tx.inputs[0].owners_before[0]}`
  }, {
    id: `${parsedDid.did}#output-0`,
    type: 'Ed25519VerificationKey2020',
    controller: `${parsedDid.did}#output-0`,
    publicKeyMultibase: `z${tx.outputs[0].public_keys[0]}`
    //                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // same as tx.outputs[0].condition.details.public_key
  }];

  return {
    '@context': [
      config.DID_CONTEXT,
      config.ED25519_CONTEXT
      // TODO replace with config.VEFIFIABLE_CONDITIONS_CONTEXT
    ],
    id: parsedDid.did,
    verificationMethod,
    assertionMethod: [`${parsedDid.did}#input-0`],
    // assertion is pointing to tx input
    service: {
      id: 'https://riddleandcode.com',
      type: 'LinkedDomains',
      serviceEndpoint: 'https://main.r3c.network'
    }
  };
}

/**
 * Comment
 * @param {string} did
 * @param {parsed} ParsedDid - TODO define
 * @param {didResolver} DidResolver - TODO define
 * @param {options} DidResolutionOptions - TODO define
 */
async function resolve(did, parsed, didResolver, options) {

  let didDocument = null;
  let didDocumentMetadata = null;
  let err = null;

  do {
    try {
      didDocument = await getDidDocument(parsed);
    } catch (error) {
      err = `resolver-error: ${error}`;
      break;
    }

    // TODO: DID document checks

  } while (false)

  if (err) {
    return {
      didDocument,
      didDocumentMetadata,
      didResolutionMetadata: {
        error: 'notFound',
        message: err,
      },
    };
  } else {
    return {
      didDocument,
      didDocumentMetadata,
      didResolutionMetadata: {
        contentType: 'application/did+ld+json'
      },
    };
  }
}

/**
 * Get resolver registry for r3 -- a { r3c: resolve } object.
 * @returns {ResolverRegistry}
 */
function getResolver() {
  return { r3c: resolve };
}

module.exports = {
  resolve,
  fetchTx,
  getResolver,
  getDidDocument
};
