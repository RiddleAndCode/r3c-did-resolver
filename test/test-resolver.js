const did = require('did-resolver');
const nock = require('nock');
const tap = require('tap');

const fixtures = require('./fixtures');
const config = require('../src/config');
const {
  resolve,
  getResolver,
  getDidDocument,
  fetchTx,
} = require('../src/resolver');

// Setup mocking server intercepting conections to tx endpoint
nock(config.R3C_MAIN_HOST)
  .get(`${config.R3C_MAIN_API_TX_PATH}/${fixtures.TEST_TX_ID}`)
  .times(3) // NOTE: (!!!) increment for every additional request
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

tap.test('test getDidDocument', async t => {
  t.match(
    await getDidDocument(did.parse(fixtures.TEST_TX_DID)),
    fixtures.TEST_DID_DOCUMENT
  );
});

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
