import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Proposal, Group, Token, Option } from "../../app/types";
import { acceptedProposalTokens } from './tokens';
import { readFileFromIPFS, uploadJsonToIPFS } from '../ipfs';
import Config from "./config";

export async function createProposal(proposal: Proposal, onCancel: () => void, onFinish: (tx: FinishedTxData) => void) {
  const hash : string = await uploadJsonToIPFS({
    title: proposal.title,
    description: proposal.description,
    options: proposal.options.map(({order, description}) => { return { order, description } }),
  });
  console.log(hash);
  return openContractCall({
    functionName: 'create-proposal',
    contractAddress: Config.proposalContractAddress!,
    contractName: Config.proposalContractName!,
    functionArgs: [
      stringAsciiCV(hash),
      uintCV(proposal.groupId),
      uintCV(proposal.finishAt),
      standardPrincipalCV(proposal.token.address),
      stringAsciiCV(proposal.token.contractName),
      uintCV(proposal.options.length)
    ],
    onCancel,
    onFinish: (tx: FinishedTxData) => {
      console.log(tx);
      console.log(`https://explorer.stacks.co/txid/${tx.txId}?chain=${process.env.REACT_APP_NETWORK_ENV}`);
      onFinish(tx);
    },
    network: Config.network,
  });
}

export async function getProposalByGroup(group: Group): Promise<Proposal[]> {
  if (group.id === 0) return [];

  const response = cvToValue(
    await callReadOnlyFunction({
      contractAddress: Config.proposalContractAddress!,
      contractName: Config.proposalContractName!,
      functionName: "get-proposals-by-group",
      functionArgs: [uintCV(group.id)],
      network: Config.network,
      senderAddress: Config.proposalContractAddress!,
    })
  );
  const proposals = response.map(async ({ value }: any) => {
    const { title, description, options } = await readFileFromIPFS(value.hash.value);
    return {
      id: value.id.value,
      hash: value.hash.value,
      title: title,
      description: description,
      createdBy: value['created-by'].value,
      createdAt: value['created-at'].value,
      finishAt: value['finish-at'].value,
      groupId: value['group-id'].value,
      token: acceptedProposalTokens.find((t) => t.contractName === value['token-name'].value) as Token,
      totalVotes: value['total-votes'].value,
      options: options.map((option) => {
        return { ...option, totalVotes: value.votes.value[option.order].value };
      })
    };
  });
  return Promise.all(proposals);
};

export async function getProposalById(id: number): Promise<Proposal> {
  const proposal = cvToValue(
    await callReadOnlyFunction({
      contractAddress: Config.proposalContractAddress!,
      contractName: Config.proposalContractName!,
      functionName: "get-proposal",
      functionArgs: [uintCV(id)],
      network: Config.network,
      senderAddress: Config.proposalContractAddress!,
    })
  );
  const { title, description, options } = await readFileFromIPFS(proposal.hash.value);
  return Promise.resolve({
    id: proposal.id.value,
    hash: proposal.hash.value,
    title: title,
    description: description,
    createdBy: proposal['created-by'].value,
    createdAt: proposal['created-at'].value,
    finishAt: proposal['finish-at'].value,
    groupId: proposal['group-id'].value,
    token: acceptedProposalTokens.find((t) => t.contractName === proposal['token-name'].value) as Token,
    totalVotes: proposal['total-votes'].value,
    options: options.map((option) => {
      return { ...option, totalVotes: proposal.votes.value[option.order].value };
    }),
    votes: proposal.votes.value
  });
}

export async function vote(proposal: Proposal, option: Option, votes: number, onCancel: () => void, onFinish: (tx: FinishedTxData) => void) {
  return openContractCall({
    functionName: 'vote',
    contractAddress: Config.proposalContractAddress!,
    contractName: Config.proposalContractName!,
    functionArgs: [uintCV(proposal.id), uintCV(option.order), uintCV(parseInt(votes.toString(), 10))], // TODO: Fix contract to accept decimals
    onCancel,
    onFinish: (tx: FinishedTxData) => {
      console.log(tx);
      console.log(`https://explorer.stacks.co/txid/${tx.txId}?chain=${process.env.REACT_APP_NETWORK_ENV}`);
      onFinish(tx);
    },
    network: Config.network,
  });
}
