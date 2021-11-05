import axios from "axios";
import { Balance } from "../../app/types";
import { getApiUrl } from './api';
import { getTokenInfo } from "./tokens";

interface TokenResponse {
  balance: number,
  total_received: number,
  total_sent: number
}

interface AxiosResponse {
  stx: TokenResponse,
  non_fungible_tokens: { [address: string]: { count: number, total_sent: number, total_received: number } },
  fungible_tokens: { [address: string]: TokenResponse }
}

export async function getBalances(address: string): Promise<Balance[]> {
  const results = await axios.get<AxiosResponse>(getApiUrl('balance', { address }));
  const balances = [
    {
      token: {
        address: '0x',
        contractName: '',
        name: 'Stacks',
        symbol: 'stx',
        decimals: 6,
        imageUri: 'https://assets.website-files.com/5f76f362793e0f513354da4f/5f7ef8d4cb3a84285395a0fc_stacks-icon-black.svg',
      },
      balance: results.data.stx.balance / Math.pow(10, 6),
      totalSent: results.data.stx.total_sent,
      totalReceived: results.data.stx.total_received,
    }
  ];
  for await (const balanceName of Object.keys(results.data.fungible_tokens)) {
    const balanceToken = results.data.fungible_tokens[balanceName];
    if (parseInt(`${balanceToken.balance}`, 10) === 0) continue;
    const token = await getTokenInfo(balanceName)
    balances.push({
      token,
      balance: balanceToken.balance / Math.pow(10, token.decimals),
      totalSent: balanceToken.total_sent,
      totalReceived: balanceToken.total_received,
    })
  };

  return balances;
}
