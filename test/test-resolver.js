const did = require('did-resolver');
const nock = require('nock');
const tap = require('tap');

const fixtures = require('./fixtures');
const config = require('../src/config');
const errMessages = require('../src/errMessages');

const {
  resolve,
  getResolver,
  txToDidDocument,
  fetchTx,
  checkTxMetadata,
  transformMetaMethods
} = require('../src/resolver');

// Setup mocking server intercepting conections to tx endpoint
nock(config.R3C_MAIN_HOST)
  .get(`${config.R3C_MAIN_API_TX_PATH}`)
  .query({
    asset_id: fixtures.TEST_TX_ID,
    last_tx: true
  })
  .times(2) // NOTE: (!!!) increment for every additional request
  .reply(200, fixtures.TEST_TX);

tap.test('test fetchTx makes http request', async t => {
  t.match(
    await fetchTx(fixtures.TEST_TX_ID),
    fixtures.TEST_TX
  );
});

tap.test('test getResolver', async t => {
  t.match(getResolver(), {r3c: resolve});
});

tap.test('test txToDidDocument', async t => {
  t.match(
    await txToDidDocument(fixtures.TEST_TX),
    fixtures.TEST_DID_DOCUMENT
  );
});

tap.test('test txToDidDocument', async t => {
  t.match(
    await txToDidDocument(fixtures.TEST_TX),
    fixtures.TEST_DID_DOCUMENT
  );
    t.match(
    await txToDidDocument(fixtures.TEST_TX, {compact: true}),
    fixtures.TEST_DID_DOCUMENT_COMPACT
  );
});

// FIXME no testcase for transaction with metadata verification methods set
tap.test('test resolve', async t => {
  t.match(
    await resolve(
      fixtures.TEST_TX_DID,
      did.parse(fixtures.TEST_TX_DID),
      null
    ), {
      didDocument: fixtures.TEST_DID_DOCUMENT,
      didDocumentMetadata: null, // TODO specify metadata
      didResolutionMetadata: {
        contentType: 'application/did+ld+json'
      },
    }
  );
});

tap.test('test checkTxMetadata', async t => {

  t.throws(() => checkTxMetadata({}), errMessages.invalidTxError);

  t.throws(
    () => checkTxMetadata({
      metadata: { verificationMethods: { controller: {} } }
    }),
    errMessages.capError);

  t.throws(
    () => checkTxMetadata({
      metadata: { verificationMethods: { capabilityInvocation: {} } }
    }),
    errMessages.capError);
});

tap.test('test transformMetaMethods', async t => {

  let testKey = `z${'0'.repeat(32)}`;

  let testVMs = {
    assertionMethod: {
      type: 'Ed25519VerificationKey2020',
      publicKeyMultibase: testKey
    },
    authentication: {
      type: 'Ed25519VerificationKey2020',
      publicKeyMultibase: testKey
    }
  };

  t.match(
    transformMetaMethods(testVMs, fixtures.TEST_TX_DID), {
      assertionMethod: [{
        id: `${fixtures.TEST_TX_DID}#meta-0`,
        controller: `${fixtures.TEST_TX_DID}#output-0`,
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: testKey
      }],
      authentication: [{
        type: 'Ed25519VerificationKey2020',
        publicKeyMultibase: testKey,
        id: `${fixtures.TEST_TX_DID}#meta-1`,
        controller: `${fixtures.TEST_TX_DID}#output-0`,
      }]
    }
  );

  t.match(transformMetaMethods({}, fixtures.TEST_TX_DID), {});
});
