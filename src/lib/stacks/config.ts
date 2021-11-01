import { StacksTestnet, StacksMainnet } from '@stacks/network';

let network;
let apiRootUrl;

switch (process.env.REACT_APP_NETWORK_ENV) {
  case 'mainnet':
    network = new StacksMainnet();
    apiRootUrl = 'https://stacks-node-api.stacks.co/';
    break;
  default:
    network = new StacksTestnet();
    apiRootUrl ='https://stacks-node-api.testnet.stacks.co/';
    break;
}

const Config = {
  contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
  groupContractAddress: process.env.REACT_APP_GROUP_CONTRACT_ADDRESS,
  groupContractName: process.env.REACT_APP_GROUP_CONTRACT_NAME,
  proposalContractAddress: process.env.REACT_APP_PROPOSAL_CONTRACT_ADDRESS,
  proposalContractName: process.env.REACT_APP_PROPOSAL_CONTRACT_NAME,
  network,
  apiRootUrl
}

export default Config;
