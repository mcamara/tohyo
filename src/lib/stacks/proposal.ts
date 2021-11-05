import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Proposal, Group } from "../../app/types";
import { acceptedProposalTokens } from './tokens';
import Config from "./config";

export async function createProposal(proposal: Proposal, onCancel: () => void, onFinish: (tx: FinishedTxData) => void) {
  debugger
  return openContractCall({
    functionName: 'create-proposal',
    contractAddress: Config.proposalContractAddress!,
    contractName: Config.proposalContractName!,
    functionArgs: [
      stringAsciiCV(proposal.title),
      uintCV(proposal.groupId),
      uintCV(proposal.finishAt),
      standardPrincipalCV(proposal.token.address),
      stringAsciiCV(proposal.token.contractName)
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
  return response.map(({ value } : any) => {
    return {
      id: value.id.value,
      title: value.title.value,
      createdBy: value['created-by'].value,
      createdAt: value['created-at'].value,
      finishAt: value['finish-at'].value,
      groupId: value['group-id'].value,
      token: acceptedProposalTokens.find((t) => t.contractName === value['token-name']),
      totalVotes: value['total-votes'].value
    };
  });
};
