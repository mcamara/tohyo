
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that a group is created and last group id is incremented",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;

    assertEquals(chain.callReadOnlyFn('group', 'get-last-group-id', [], deployer.address).result, 'u0');
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(deployer.address)], deployer.address).result,
      '{group-ids: []}'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(deployer.address)], deployer.address).result,
      '[]'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(1)], deployer.address).result,
      `{admins: [], created-at: u0, id: u0, name: "", owner: ${deployer.address}}`
    );


    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 2);

    assertEquals(chain.callReadOnlyFn('group', 'get-last-group-id', [], deployer.address).result, 'u1');
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(deployer.address)], deployer.address).result,
      '{group-ids: [u1]}'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(deployer.address)], deployer.address).result,
      `[{admins: [${deployer.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(1)], deployer.address).result,
      `{admins: [${deployer.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(2)], deployer.address).result,
      `{admins: [], created-at: u0, id: u0, name: "", owner: ${deployer.address}}`
    );


    block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("another-group")], deployer.address),
    ]);
    assertEquals(block.receipts.length, 1);
    assertEquals(block.height, 3);
    assertEquals(chain.callReadOnlyFn('group', 'get-last-group-id', [], deployer.address).result, 'u2');
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(deployer.address)], deployer.address).result,
      '{group-ids: [u1, u2]}'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(deployer.address)], deployer.address).result,
      `[{admins: [${deployer.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}, {admins: [${deployer.address}], created-at: u2, id: u2, name: "another-group", owner: ${deployer.address}}]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(2)], deployer.address).result,
      `{admins: [${deployer.address}], created-at: u2, id: u2, name: "another-group", owner: ${deployer.address}}`
    );
  },
});

Clarinet.test({
  name: "Ensure that an user can be added to be an admin of a group by the creator of the group",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let groupText = `{admins: [${deployer.address}, ${wallet1.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}`;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(deployer.address)], deployer.address).result,
      `[${groupText}]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(wallet1.address)], deployer.address).result,
      `[${groupText}]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet1.address)], wallet1.address).result,
      '{group-ids: [u1]}'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(1)], wallet1.address).result,
      groupText
    );
  },
});

Clarinet.test({
  name: "Ensure that an admin can be removed",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let groupText = `{admins: [${deployer.address}, ${wallet1.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}`;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(wallet1.address)], deployer.address).result,
      `[${groupText}]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet1.address)], wallet1.address).result,
      '{group-ids: [u1]}'
    );

    block = chain.mineBlock([
      Tx.contractCall('group', 'remove-admin-from-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-groups', [types.principal(wallet1.address)], deployer.address).result,
      `[]`
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet1.address)], wallet1.address).result,
      '{group-ids: []}'
    );
    assertEquals(
      chain.callReadOnlyFn('group', 'get-group', [types.uint(1)], wallet1.address).result,
      `{admins: [${deployer.address}], created-at: u1, id: u1, name: "new-group", owner: ${deployer.address}}`
    );
  },
});


// Test errors
Clarinet.test({
  name: "Ensure that groups name cannot be empty",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("")], deployer.address),
    ]);
    let [receipt] = block.receipts;
    receipt.result.expectErr().expectUint(102);
  },
});

Clarinet.test({
  name: "Ensure that if an admin of a group tries to add another the same admin twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);

    let [receipt] = block.receipts;
    receipt.result.expectErr().expectUint(101);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet1.address)], wallet1.address).result,
      '{group-ids: [u1]}'
    );
  },
});

Clarinet.test({
  name: "Ensure that if an admin of a group tries to add another, it fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let wallet2 = accounts.get('wallet_2')! as Account;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet2.address)], wallet1.address),
    ]);

    let [receipt] = block.receipts;
    receipt.result.expectErr().expectUint(100);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet2.address)], wallet1.address).result,
      '{group-ids: []}'
    );
  },
});

Clarinet.test({
  name: "Ensure that if an admin of a group tries to remove another without being the onwer, it fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let wallet2 = accounts.get('wallet_2')! as Account;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet2.address)], deployer.address),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 2);

    block = chain.mineBlock([
      Tx.contractCall('group', 'remove-admin-from-group', [types.uint(1), types.principal(wallet2.address)], wallet1.address),
    ]);

    let [receipt] = block.receipts;
    receipt.result.expectErr().expectUint(100);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet2.address)], wallet1.address).result,
      '{group-ids: [u1]}'
    );
  },
});

Clarinet.test({
  name: "Ensure that if an owner of a group tries to remove another where the user is not an admin, it fails",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let wallet2 = accounts.get('wallet_2')! as Account;

    var block = chain.mineBlock([
      Tx.contractCall('group', 'create-group', [types.ascii("new-group")], deployer.address),
      Tx.contractCall('group', 'add-admin-to-group', [types.uint(1), types.principal(wallet1.address)], deployer.address),
    ]);

    block = chain.mineBlock([
      Tx.contractCall('group', 'remove-admin-from-group', [types.uint(1), types.principal(wallet2.address)], deployer.address),
    ]);

    let [receipt] = block.receipts;
    receipt.result.expectErr().expectUint(104);

    assertEquals(
      chain.callReadOnlyFn('group', 'get-group-ids-by-account', [types.principal(wallet2.address)], wallet1.address).result,
      '{group-ids: []}'
    );
  },
});
