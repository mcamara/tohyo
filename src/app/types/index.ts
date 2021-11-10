export type Balance = {
  token: Token;
  balance: number;
  totalSent: number;
  totalReceived: number;
}

export type Token = {
  address: string;
  contractName: string,
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
  admins: Array<string>,
  owner: string,
  created_at: number
}

export type Proposal = {
  id: number,
  hash: string,
  title: string,
  description: string,
  createdBy: string,
  createdAt: number,
  finishAt: number,
  groupId: number,
  token: Token,
  totalVotes: number,
  votes: Array<number>,
  options: Array<Option>
}

export type Option = {
  order: number,
  description: string,
  totalVotes: number,
}
