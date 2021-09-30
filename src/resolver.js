const config = require('./config');
const errMessages = require('./errMessages');
const did = require('did-resolver');
const http = require('http');

/**
 * Object representing a DID (returned by did-resolver.parse)
 * @typedef {Object} ParsedDid
 * @param {string} parsedDid.did
 * @param {string} parsedDid.method
 * @param {string} parsedDid.id
 */

/**
 * Fetch http request body.
 * @param {(string | Object)} options - URL or http options.
 * @param {string} options.host
 * @param {number} options.port
 * @param {string} options.path
 * @param {string} options.method=GET
 * @returns {Promise.<string>} - Body of http request result.
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
 * @returns {Object} - Transactioin object
 */
async function fetchTx (id) {
  // TODO catch error
  return JSON.parse(
    await getBody(
      `${config.R3C_TX_ENDPOINT}?asset_id=${id}&last_tx=true`
    )
  );
}

/**
 * Throw error if tranaction metdata is invalid.
 * @param {Object} tx
 * @returns {(Object | undefined)} - Additional verification methods
 *   mapping. Or undefined.
 */
function checkTxMetadata(tx) {
  if (tx.metadata === undefined)
    throw new Error(errMessages.invalidTxError);
  if (tx.metadata !== null
      && tx.metadata.verificationMethods !== undefined) {
    let vm = tx.metadata.verificationMethods;
    if (vm.controller || vm.capabilityInvocation)
      throw new Error(errMessages.capError);
    return vm;
  }
  return {};
}

/**
 * Transform metadata field objects to correct verificaton methods
 * object.
 * @param {Object} vms
 * @param {Object} did - DID URL to be used as controller
 * @returns {(Object | undefined)} - Additional verification methods
 *   mapping. Or undefined.
 */
function transformMetaMethods(vms, did) {
  const reducer = (acc, [k, v], i) => (
    // FIXME: here I make an asumption that there will be only one
    // key for each "verification purpose"
    acc[k] = [{
      id: `${did}#meta-${i}`,
      controller: `${did}#output-0`,
      ...v
      // v contains mapping of form {
      //   type: <keyType>,
      //   <publicKeyType>: <putlicKeyValue>
      // }
    }],
    acc
  );
  return Object.entries(vms).reduce(reducer, {});
}

/**
 * Construct DidDocument from fetched R3C transaction.
 * @param {Object} tx - BigchainDB transaciont objec
 * @param {Object} [options]
 * @param {Object} options.compact - Do not expand relative DID liks.
 * @returns {Object} - Did document object
 */
async function txToDidDocument(tx, options = {}) {

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

  let txDID = `did:r3c:${tx.id}`;
  let verificationMethod = [{
    id: `${txDID}#input-0`,
    type: 'Ed25519VerificationKey2020',
    controller: `${txDID}#output-0`,
    //                    ^^^^^^^^
    // assuming here that contrloller here is an output controller,
    // same goes for output-0
    publicKeyBase58: `${tx.inputs[0].owners_before[0]}`
  }, {
    id: `${txDID}#output-0`,
    type: 'Ed25519VerificationKey2020',
    controller: `${txDID}#output-0`,
    publicKeyBase58: `${tx.outputs[0].public_keys[0]}`
    //                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // same as tx.outputs[0].condition.details.public_key
  }];

  return {
    '@context': [
      config.DID_CONTEXT,
      config.ED25519_CONTEXT
      // TODO replace with config.VEFIFIABLE_CONDITIONS_CONTEXT
    ],
    id: txDID,
    verificationMethod,
    assertionMethod: [
      options.compact ? `${txDID}#input-0` : verificationMethod[0]
    ],
    capabilityInvocation: [
      options.compact ? `${txDID}#output-0` : verificationMethod[1]
    ],
    ...transformMetaMethods(checkTxMetadata(tx), txDID),
    // meta-methods keys shadow assertion and capabilityInvocation
    // fields if present
    service: {
      id: 'https://riddleandcode.com',
      type: 'LinkedDomains',
      serviceEndpoint: 'https://main.r3c.network'
    }
  };
}

/**
 * Return Did document object constructed from fetched R3C
 * transaction.
 * @param {string} did - DID string
 * @param {ParsedDid} ParsedDid
 * @param {*} DidResolver
 * @param {*} DidResolutionOptions
 */
async function resolve(did, parsed, didResolver, options) {

  let didDocument = null;
  let didDocumentMetadata = null;
  let err = null;

  do {
    try {
      didDocument = await txToDidDocument(await fetchTx(parsed.id));
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
 * R3C resolver maping.
 * @typedef {Object} R3CResolver
 * @param {function} R3CResolver.r3c
 */

/**
 * Get resolver registry.
 * @returns {R3CResolver} - a { r3c: resolve } object.
 */
function getResolver() {
  return { r3c: resolve };
}

module.exports = {
  resolve,
  fetchTx,
  getResolver,
  txToDidDocument,
  checkTxMetadata,
  transformMetaMethods
};
