import axios from "axios";
import { Token } from "../../app/types";
import { getApiUrl } from './api';

interface AxiosResponse {
  token_uri: string,
  name: string,
  image_uri: string,
  decimals: 6,
  symbol: string,
  sender_address: string
}

export async function getTokenInfo(address: string): Promise<Token> {
  const regexp1 = /::[a-zA-z-]+$/
  const results = await axios.get<AxiosResponse>(getApiUrl('tokenData', { address: address.replace(regexp1, '') }));
  return {
    address: results.data.sender_address,
    contractName: address.split('.')[1],
    name: results.data.name,
    symbol: results.data.symbol,
    decimals: results.data.decimals,
    imageUri: results.data.image_uri,
  }
}

export const acceptedProposalTokens : Array<Token> = [
  // TODO: Make this list dynamic
  {
    address: "ST26902A6NT1QSWQXXYM55EM579RY9CCPQDN02QW2",
    contractName: 'arkadiko-token::diko',
    name: "Arkadiko Token",
    symbol: "DIKO",
    decimals: 6,
    imageUri: ''
  },
  {
    address: "ST26902A6NT1QSWQXXYM55EM579RY9CCPQDN02QW2",
    contractName: 'stdiko-token::stdiko',
    name: "Staked Arkadiko Token",
    symbol: "stDIKO",
    decimals: 6,
    imageUri: ''
  },
  {
    address: 'ST26902A6NT1QSWQXXYM55EM579RY9CCPQDN02QW2',
    contractName: 'usda-token::usda',
    name: 'USDA',
    symbol: 'USDA',
    decimals: 6,
    imageUri: ''
  }
];
