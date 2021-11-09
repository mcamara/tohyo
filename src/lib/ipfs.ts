import { create as ipfsClient } from 'ipfs-http-client';

const bearer = `${process.env.REACT_APP_INFURA_IPFS_PROJECT_ID}:${process.env.REACT_APP_INFURA_IPFS_PROJECT_SECRET}`
const IPFSClient = ipfsClient({
  host: process.env.REACT_APP_INFURA_IPFS_ENDPOINT_HOST,
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(bearer).toString('base64')}`
  }
});

export async function uploadJsonToIPFS (data: any) : Promise<string> {
  const { cid } = await IPFSClient.add(JSON.stringify(data, null, 2));
  return cid.toString();
}

interface ipfsFileType {
  title: string,
  description: string
}

export async function readFileFromIPFS(hash: string): Promise<ipfsFileType> {
  const response = IPFSClient.cat('QmZ6wJdDUxNkonLQQxDDu29Qwk74UBYhG347shETECvDep');
  let text = '';
  for await (const chunk of response) {
    text = `${text}${new TextDecoder("utf-8").decode(chunk)}`
  }
  return JSON.parse(text);
}

export default IPFSClient;
