export type Balance = {
  token: Token;
  balance: number;
  totalSent: number;
  totalReceived: number;
}

export type Token = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  imageUri: string;
}

export type Account = {
  address?: string;
  image?: string;
  name?: string;
  domain?: string;
}
