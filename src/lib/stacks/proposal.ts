import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Proposal, Group, Token } from "../../app/types";
import Config from "./config";

export async function createProposal(
  title: string, group: Group, finishAt: number, token: Token, onCancel: () => void, onFinish: (tx: FinishedTxData) => void
) {
  return openContractCall({
    functionName: 'create-proposal',
    contractAddress: Config.proposalContractAddress!,
    contractName: Config.proposalContractName!,
    functionArgs: [stringAsciiCV(title), uintCV(group.id), uintCV(finishAt), standardPrincipalCV(token.address)],
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
      tokenAddress: value.token.value,
      totalVotes: value['total-votes'].value
    };
  });
};

// export async function getGroupsById(id: number): Promise<Group> {
//   try {
//     const response = cvToValue(
//       await callReadOnlyFunction({
//         contractAddress: Config.groupContractAddress!,
//         contractName: Config.groupContractName!,
//         functionName: "get-group",
//         functionArgs: [uintCV(id)],
//         network: Config.network,
//         senderAddress: Config.groupContractAddress!,
//       })
//     );
//     return {
//       id: response.id.value,
//       name: response.name.value,
//       admins: response.admins.value.map((a: any) => a.value),
//       owner: response.owner.value,
//       created_at: response['created-at'].value
//     };
//   } catch (error) {
//     return {
//       id: 0,
//       name: "",
//       admins: [],
//       owner: "",
//       created_at: 0
//     }
//   }
// };
