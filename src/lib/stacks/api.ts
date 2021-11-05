import Config from "./config";

interface hashType {
  [name: string]: string;
}

const urlList : hashType = {
  balance: 'extended/v1/address/:address/balances',
  tokenData: 'extended/v1/tokens/:address/ft/metadata',
  currentBlock: 'extended/v1/block'
}

export function getApiUrl(action: string, params: hashType = {}) {
  let url = `${Config.apiRootUrl}${urlList[action]}`;
  for (let key of Object.keys(params)) {
    if (url.search(`/:${key}/`) !== -1) {
      url = url.replace(`/:${key}/`, `/${params[key]}/`);
    }
  }
  return url;
}
