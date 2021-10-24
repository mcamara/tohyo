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
    address: address,
    name: results.data.name,
    symbol: results.data.symbol,
    decimals: results.data.decimals,
    imageUri: results.data.image_uri,
  }
}

