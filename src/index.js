const { getResolver, txToDidDocument } = require('./resolver');
const config = require('./config');

module.exports = {
  getResolver,
  txToDidDocument,
  fallbackApiEndpoint: config.R3C_MAIN_HOST
};
