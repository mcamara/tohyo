import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, stringAsciiCV } from "@stacks/transactions";
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
