import { AppConfig, UserSession, showConnect } from "@stacks/connect";
import { Person } from '@stacks/profile';
import { Account } from "../../app/types";
import { callReadOnlyFunction, cvToValue, standardPrincipalCV } from "@stacks/transactions";
import Config from "./config";
import { getApiUrl } from './api';
import axios from "axios";

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export function authenticate(onFinish : () => any) {
  showConnect({
    appDetails: {
      name: 'Testing app',
      icon: `${window.location.origin}/logo512.png`,
    },
    redirectTo: '/',
    onFinish,
    userSession
  });
}

export function getAccount() : Account {
  if (userSession.isUserSignedIn()) {
    return {
      address: getUserSTXAddress(),
      name: displayName(),
      image: `https://robohash.org/${getUserSTXAddress()}?set=set4`,
    }
  }

  return {
    address: undefined,
    name: undefined,
    image: undefined,
  }
}

export async function getBtcDomain(address : string) : Promise<string> {
  if (process.env.REACT_APP_NETWORK_ENV !== 'mainnet') return '';

  const result = cvToValue(
    await callReadOnlyFunction({
      contractName: 'bns',
      contractAddress: 'SP000000000000000000002Q6VF78',
      functionName: "resolve-principal",
      functionArgs: [standardPrincipalCV(address)],
      network: Config.network,
      senderAddress: address,
    })
  ).value;
  const domainName = Buffer.from(result.name.value.substr(2), 'hex').toString('ascii') + '.' + Buffer.from(result.namespace.value.substr(2), 'hex').toString('ascii');
  return domainName;

}

export function getUserData() {
  return userSession.loadUserData();
}

export function getPerson() {
  return new Person(getUserData().profile);
}

export function getUserSTXAddress() {
  return getUserData().profile.stxAddress[String(process.env.REACT_APP_NETWORK_ENV)];
}

export function displayName() {
  const userData = getUserData();
  return userData.username || userData.identityAddress;
}


export async function getCurrentBlock() : Promise<number> {
  // TODO: Move this somewhere else
  const results = await axios.get<{total: number}>(getApiUrl('currentBlock'));
  return results.data.total;
}
