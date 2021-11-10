import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV, standardPrincipalCV, uintCV } from "@stacks/transactions";
import { Account, Group } from "../../app/types";
import Config from "./config";

export async function createGroup(name: string, onCancel: () => void, onFinish: (tx: FinishedTxData) => void) {
  return openContractCall({
    functionName: 'create-group',
    contractAddress: Config.groupContractAddress!,
    contractName: Config.groupContractName!,
    functionArgs: [stringAsciiCV(name)],
    onCancel,
    onFinish: (tx: FinishedTxData) => {
      console.log(tx);
      console.log(`https://explorer.stacks.co/txid/${tx.txId}?chain=${process.env.REACT_APP_NETWORK_ENV}`);
      onFinish(tx);
    },
    network: Config.network,
    // senderAddress: getUserData().identityAddress,
  });
}

export async function getAllGroups(): Promise<Array<Group>> {
  try {
    const response = cvToValue(
      await callReadOnlyFunction({
        contractAddress: Config.groupContractAddress!,
        contractName: Config.groupContractName!,
        functionName: "groups",
        functionArgs: [],
        network: Config.network,
        senderAddress: Config.groupContractAddress!,
      })
    );
    return response.map(async ({ group }: any) => {
      return {
        id: group.id.value,
        name: group.name.value,
        admins: group.admins.value.map((a: any) => a.value),
        owner: group.owner.value,
        created_at: group['created-at'].value
      };
    })
  } catch (error) {
    return [];
  }
}

export async function getGroupsById(id: number): Promise<Group> {
  try {
    const response = cvToValue(
      await callReadOnlyFunction({
        contractAddress: Config.groupContractAddress!,
        contractName: Config.groupContractName!,
        functionName: "get-group",
        functionArgs: [uintCV(id)],
        network: Config.network,
        senderAddress: Config.groupContractAddress!,
      })
    );
    return {
      id: response.id.value,
      name: response.name.value,
      admins: response.admins.value.map((a: any) => a.value),
      owner: response.owner.value,
      created_at: response['created-at'].value
    };
  } catch (error) {
    return {
      id: 0,
      name: "",
      admins: [],
      owner: "",
      created_at: 0
    }
  }
};

export async function getGroupsByAccount(account: Account): Promise<Array<Group>> {
  try {
    if (!account.address) return [];

    const response = cvToValue(
      await callReadOnlyFunction({
        contractAddress: Config.groupContractAddress!,
        contractName: Config.groupContractName!,
        functionName: "get-groups",
        functionArgs: [standardPrincipalCV(account.address)],
        network: Config.network,
        senderAddress: Config.groupContractAddress!,
      })
    );

    return response.map(({ value }: any) => {
      return {
        id: value.id.value,
        name: value.name.value,
        admins: value.admins.value.map((a: any) => a.value),
        owner: value.owner.value,
        created_at: value['created-at'].value
      };
    })
  } catch (error) {
    return [];
  }
}

