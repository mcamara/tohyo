import { FinishedTxData, openContractCall } from "@stacks/connect";
import { callReadOnlyFunction, cvToValue, standardPrincipalCV } from "@stacks/transactions";
import { getUserSTXAddress, userSession } from "./auth";
import Config from "./config";

export async function getTopCounter() {
  const response = cvToValue(
    await callReadOnlyFunction({
      contractName: Config.contractName!,
      contractAddress: Config.contractAddress!,
      functionName: "get-top-counter",
      functionArgs: [],
      network: Config.network,
      senderAddress: Config.contractAddress!,
    })
  );
  return {
    who: response.who.value,
    count: response.count.value,
  }
};

export async function countUp(onCancel: () => void, onFinish: (url: String) => void) {
  return openContractCall({
    functionName: 'count-up',
    contractAddress: Config.contractAddress!,
    contractName: Config.contractName!,
    functionArgs: [],
    onCancel,
    onFinish: (tx: FinishedTxData) => {
      console.log(tx);
      onFinish(`https://explorer.stacks.co/txid/${tx.txId}?chain=${process.env.REACT_APP_NETWORK_ENV}`);
    },
    network: Config.network,
    // senderAddress: getUserData().identityAddress,
  });
}

export async function getTotalCount() {
  const response = cvToValue(
    await callReadOnlyFunction({
      contractName: Config.contractName!,
      contractAddress: Config.contractAddress!,
      functionName: "get-total-count",
      functionArgs: [],
      network: Config.network,
      senderAddress: Config.contractAddress!,
    })
  );
  return parseInt(response, 10);
}

export async function getMyCount() {
  if (!userSession.isUserSignedIn()) return;

  const response = cvToValue(
    await callReadOnlyFunction({
      contractName: Config.contractName!,
      contractAddress: Config.contractAddress!,
      functionName: "get-count",
      functionArgs: [standardPrincipalCV(getUserSTXAddress()!)],
      network: Config.network,
      senderAddress: Config.contractAddress!,
    })
  );
  return parseInt(response, 10);
}

