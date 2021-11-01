
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const firstProposaText = (address: string) => {
  return `{created-at: u1, creator: ${address}, finish-at: u10, group-id: u1, id: u1, title: "new proposal", token: ${address}, total-votes: u0}`
}
const secondProposaText = (address: string) => {
  return `{created-at: u2, creator: ${address}, finish-at: u10, group-id: u1, id: u2, title: "another proposal", token: ${address}, total-votes: u0}`
}

Clarinet.test({
  name: "Ensure that a group is created and last group id is incremented",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;

    assertEquals(chain.callReadOnlyFn('proposal', 'get-last-proposal-id', [], deployer.address).result, 'u0');
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal-ids-by-group', [types.uint(1)], deployer.address).result,
      '{proposal-ids: []}'
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposals-by-group', [types.uint(1)], deployer.address).result,
      '[]'
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(1)], deployer.address).result,
      `{created-at: u0, creator: ${deployer.address}, finish-at: u0, group-id: u0, id: u0, title: "", token: ${deployer.address}.group, total-votes: u0}`
    );

    // creation of group and first proposal
    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall(
        'proposal', 'create-proposal',
        [types.ascii("new proposal"), types.uint(1), types.uint(10), types.principal(deployer.address)],
        deployer.address
      ),
    ]);

    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    assertEquals(chain.callReadOnlyFn('proposal', 'get-last-proposal-id', [], deployer.address).result, 'u1');

    // creation of second proposal
    block = chain.mineBlock([
      Tx.contractCall(
        'proposal', 'create-proposal',
        [types.ascii("another proposal"), types.uint(1), types.uint(10), types.principal(deployer.address)],
        deployer.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);

    assertEquals(chain.callReadOnlyFn('proposal', 'get-last-proposal-id', [], deployer.address).result, 'u2');

    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal-ids-by-group', [types.uint(1)], deployer.address).result,
      '{proposal-ids: [u1, u2]}'
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposals-by-group', [types.uint(1)], deployer.address).result,
      `[${firstProposaText(deployer.address)}, ${secondProposaText(deployer.address)}]`
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(1)], deployer.address).result,
      firstProposaText(deployer.address)
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(2)], deployer.address).result,
      secondProposaText(deployer.address)
    );
  },
});
