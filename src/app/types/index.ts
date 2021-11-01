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

export type Group = {
  id: number,
  name: string,
  admins: Array<String>,
  owner: String,
  created_at: number
}

export type Proposal = {
  id: number,
  title: string,
  createdBy: String,
  createdAt: number,
  finishAt: number,
  groupId: number,
  tokenAddress: Token,
  totalVotes: number
}
