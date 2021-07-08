
const DID_CONTEXT = 'https://www.w3.org/ns/did/v1';
const VEFIFIABLE_CONDITIONS_CONTEXT = 'https://w3c-ccg.github.io/verifiable-conditions/contexts/verifiable-conditions-2021-v1.json';
const ED25519_CONTEXT = 'https://w3id.org/security/suites/ed25519-2020/v1';


const R3C_MAIN_HOST = 'http://main.r3c.network';
const R3C_MAIN_API_PATH = '/api/v1';
const R3C_MAIN_API_TX_PATH = `${R3C_MAIN_API_PATH}/transactions`;
const R3C_TX_ENDPOINT = `${R3C_MAIN_HOST}${R3C_MAIN_API_TX_PATH}`;

module.exports = {
  DID_CONTEXT,
  VEFIFIABLE_CONDITIONS_CONTEXT,
  R3C_MAIN_HOST,
  R3C_MAIN_API_TX_PATH,
  R3C_TX_ENDPOINT,
  ED25519_CONTEXT
};
