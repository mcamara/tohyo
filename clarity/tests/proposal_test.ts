
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

const firstProposaText = (address: string) => {
  return `{created-at: u1, created-by: ${address}, finish-at: u10, group-id: u1, hash: "new proposal", id: u1, options-number: u5, token-address: ${address}, token-name: "DIKO", total-votes: u0, votes: [u0, u0, u0, u0, u0, u0, u0, u0, u0, u0]}`
}
const secondProposaText = (address: string) => {
  return `{created-at: u2, created-by: ${address}, finish-at: u10, group-id: u1, hash: "another proposal", id: u2, options-number: u5, token-address: ${address}, token-name: "DIKO", total-votes: u0, votes: [u0, u0, u0, u0, u0, u0, u0, u0, u0, u0]}`
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
      `{created-at: u0, created-by: ${deployer.address}, finish-at: u0, group-id: u0, hash: "", id: u0, options-number: u0, token-address: ${deployer.address}, token-name: "", total-votes: u0, votes: []}`
    );

    // creation of group and first proposal
    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall(
        'proposal', 'create-proposal',
        [types.ascii("new proposal"), types.uint(1), types.uint(10), types.principal(deployer.address), types.ascii("DIKO"), types.uint(5)],
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
        [types.ascii("another proposal"), types.uint(1), types.uint(10), types.principal(deployer.address), types.ascii("DIKO"), types.uint(5)],
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

Clarinet.test({
  name: "Ensure that a proposal can be voted when number of tokens is correct",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let wallet2 = accounts.get('wallet_2')! as Account;

    // creation of group and first proposal, it finishes the voting on the fifth block included
    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall(
        'proposal', 'create-proposal',
        [types.ascii("new proposal"), types.uint(1), types.uint(5), types.principal(deployer.address), types.ascii("DIKO"), types.uint(5)],
        deployer.address
      ),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);
    assertEquals(chain.callReadOnlyFn('proposal', 'get-last-proposal-id', [], deployer.address).result, 'u1');

    block = chain.mineBlock([
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(3), types.uint(50000)], deployer.address),
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(2), types.uint(20000)], wallet1.address),
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(2), types.uint(70000)], wallet2.address),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 3);

    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(1)], deployer.address).result,
      `{created-at: u1, created-by: ${deployer.address}, finish-at: u5, group-id: u1, hash: "new proposal", id: u1, options-number: u5, token-address: ${deployer.address}, token-name: "DIKO", total-votes: u140000, votes: [u0, u0, u90000, u50000, u0, u0, u0, u0, u0, u0]}`
    );

    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-votes-for-an-user-and-proposal', [types.uint(1), types.principal(deployer.address)], deployer.address).result,
      "{votes: u50000}"
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-votes-for-an-user-and-proposal', [types.uint(1), types.principal(wallet2.address)], deployer.address).result,
      "{votes: u70000}"
    );
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-votes-for-an-user-and-proposal', [types.uint(1), types.principal(wallet2.address)], deployer.address).result,
      "{votes: u70000}"
    );

    block = chain.mineBlock([
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(0), types.uint(50000)], deployer.address),
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(3), types.uint(20000)], wallet1.address),
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(2), types.uint(700000)], wallet2.address),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 4);

    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(1)], deployer.address).result,
      `{created-at: u1, created-by: ${deployer.address}, finish-at: u5, group-id: u1, hash: "new proposal", id: u1, options-number: u5, token-address: ${deployer.address}, token-name: "DIKO", total-votes: u910000, votes: [u50000, u0, u790000, u70000, u0, u0, u0, u0, u0, u0]}`
    );

    // This option does not exist
    block = chain.mineBlock([
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(6), types.uint(50000)], deployer.address),
    ]);
    assertEquals(block.height, 5);
    block.receipts[0].result.expectErr().expectUint(114);

    // User 2 does not have enough tokens
    block = chain.mineBlock([
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(2), types.uint(250000)], wallet2.address),
    ]);
    assertEquals(block.height, 6);
    block.receipts[0].result.expectErr().expectUint(113);

    // Now it is too late to vote
    block = chain.mineBlock([
      Tx.contractCall('proposal', 'vote', [types.uint(1), types.uint(3), types.uint(50000)], deployer.address),
    ]);
    assertEquals(block.height, 7);
    block.receipts[0].result.expectErr().expectUint(111);

    // Nothing have changed
    assertEquals(
      chain.callReadOnlyFn('proposal', 'get-proposal', [types.uint(1)], deployer.address).result,
      `{created-at: u1, created-by: ${deployer.address}, finish-at: u5, group-id: u1, hash: "new proposal", id: u1, options-number: u5, token-address: ${deployer.address}, token-name: "DIKO", total-votes: u910000, votes: [u50000, u0, u790000, u70000, u0, u0, u0, u0, u0, u0]}`
    );
  },
});
