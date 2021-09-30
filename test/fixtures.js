const TEST_TX_ID = '135e55e01819b2a8dfbad7489ab5ebfe1b92768880ee9e0d7204a49956e846d5';
const TEST_TX = {
  'asset': {'data': {'uuid': 'f3036b15-70b6-410e-8567-46e500b87081'}},
  'id': TEST_TX_ID,
  'inputs': [{'fulfillment': 'pGSAILg2h6rjKlDcfQ9i_rab4qXMszoMv9_9MLsNIWZwxYKlgUC9XRQY3Z4wBL5iBsxOSW8MkIVHeLrOohi6cOZKqETcGiQMv56vD7simkP8ofzdrtKEDuUVgVy_21kACgznfVoP',
              'fulfills': null,
              'owners_before': ['DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS']}],
  'metadata': null,
  'operation': 'CREATE',
  'outputs': [{'amount': '100',
               'condition': {'details': {'public_key': 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS',
                                         'type': 'ed25519-sha-256'},
                             'uri': 'ni:///sha-256;VJhEceI-J0hERg8pOTt_acpMA6GVJjE-bHDocTe4U3w?fpt=ed25519-sha-256&cost=131072'},
               'public_keys': ['DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS']}],
  'version': '2.0'};

const TEST_TX_DID = `did:r3c:${TEST_TX_ID}`;


// This is an example document that should produced from TEST_TX.  At
// the curret state of implemetntatioin it reflects only possible
// use-case for r3c resolver (no criptoconditions support single
// owner-before and single output with Ed25519 condition)

const TEST_DID_DOCUMENT = {
  id: TEST_TX_DID,
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1'
  ],
  service: {
    id: 'https://riddleandcode.com',
    type: 'LinkedDomains',
    serviceEndpoint: 'https://main.r3c.network'
  },
  verificationMethod: [{
    id: `${TEST_TX_DID}#input-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`, // <- not a typo
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }, {
    id: `${TEST_TX_DID}#output-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`,
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }],
  assertionMethod: [{
    id: `${TEST_TX_DID}#input-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`, // <- not a typo
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }],
  capabilityInvocation: [{
    id: `${TEST_TX_DID}#output-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`,
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }]
};

const TEST_DID_DOCUMENT_COMPACT = {
  id: TEST_TX_DID,
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/ed25519-2020/v1'
    // 'https://w3c-ccg.github.io/verifiable-conditions/contexts/verifiable-conditions-2021-v1.json'
  ],
  service: {
    id: 'https://riddleandcode.com',
    type: 'LinkedDomains',
    serviceEndpoint: 'https://main.r3c.network'
  },
  // NOTE publicKeyMultibase encodes base encoding types with leading
  // char. In our case base58 encoding denoted by 'z'
  // more here: https://github.com/multiformats/multibase/blob/master/multibase.csv
  verificationMethod: [{
    id: `${TEST_TX_DID}#input-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`, // <- not a typo
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }, {
    id: `${TEST_TX_DID}#output-0`,
    type: 'Ed25519VerificationKey2020',
    "controller": `${TEST_TX_DID}#output-0`,
    "publicKeyBase58": 'DQ6F6J8PYS11RMmwcnB8bPWwHkoPFytxNUydRPQh9TBS'
  }],
  assertionMethod: [`${TEST_TX_DID}#input-0`],
  capabilityInvocation: [`${TEST_TX_DID}#output-0`]
};

module.exports = {
  TEST_TX,
  TEST_TX_ID,
  TEST_TX_DID,
  TEST_DID_DOCUMENT,
  TEST_DID_DOCUMENT_COMPACT
};
