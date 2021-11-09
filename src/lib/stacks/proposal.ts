import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Proposal, Group } from "../../app/types";
import { acceptedProposalTokens } from './tokens';
import { uploadJsonToIPFS, readFileFromIPFS } from '../ipfs';
import Config from "./config";

export async function createProposal(proposal: Proposal, onCancel: () => void, onFinish: (tx: FinishedTxData) => void) {
  const hash : string = await uploadJsonToIPFS({
    title: proposal.title, description: proposal.description
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
      uintCV(4)
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
  return response.map(async ({ value } : any) => {
    const info = await readFileFromIPFS(value.hash.value);

    return {
      id: value.id.value,
      title: info.title,
      description: info.description,
      createdBy: value['created-by'].value,
      createdAt: value['created-at'].value,
      finishAt: value['finish-at'].value,
      groupId: value['group-id'].value,
      token: acceptedProposalTokens.find((t) => t.contractName === value['token-name']),
      totalVotes: value['total-votes'].value
    };
  });
};
