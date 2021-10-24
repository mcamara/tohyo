
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Ensure that contract can count and edit the top counter and the total count",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get('deployer')! as Account;
    let wallet1 = accounts.get('wallet_1')! as Account;
    let wallet2 = accounts.get('wallet_2')! as Account;

    const firstCounter = chain.callReadOnlyFn('count', 'get-top-counter', [], deployer.address).result;

    assertEquals(firstCounter, `{count: u0, who: ${deployer.address}}`);
    assertEquals(
      chain.callReadOnlyFn('count', 'get-count', [types.principal(deployer.address)], deployer.address).result,
      'u0'
    );
    assertEquals(chain.callReadOnlyFn('count', 'get-total-count', [], deployer.address).result, 'u0');

    let block = chain.mineBlock([
      Tx.contractCall('count', 'count-up', [], wallet1.address),
      Tx.contractCall('count', 'count-up', [], wallet1.address),
      Tx.contractCall('count', 'count-up', [], wallet2.address),
    ]);
    assertEquals(block.receipts.length, 3);
    assertEquals(block.height, 2);

    const secondCounter = chain.callReadOnlyFn(
      'count', 'get-top-counter', [], deployer.address
    ).result;
    assertEquals(secondCounter, `{count: u2, who: ${wallet1.address}}`);
    assertEquals(
      chain.callReadOnlyFn('count', 'get-count', [types.principal(deployer.address)], deployer.address).result,
      'u0'
    );
    assertEquals(
      chain.callReadOnlyFn('count', 'get-count', [types.principal(wallet2.address)], deployer.address).result,
      'u1'
    );
    assertEquals(
      chain.callReadOnlyFn('count', 'get-total-count', [], deployer.address).result,
      'u3'
    );

    block = chain.mineBlock([
      Tx.contractCall('count', 'count-up', [], wallet2.address),
      Tx.contractCall('count', 'count-up', [], wallet2.address),
    ]);
    assertEquals(block.receipts.length, 2);
    assertEquals(block.height, 3);

    const thirdCounter = chain.callReadOnlyFn(
      'count', 'get-top-counter', [], deployer.address
    ).result;
    assertEquals(thirdCounter, `{count: u3, who: ${wallet2.address}}`);
    assertEquals(
      chain.callReadOnlyFn('count', 'get-count', [types.principal(wallet2.address)], deployer.address).result,
      'u3'
    );
    assertEquals(
      chain.callReadOnlyFn('count', 'get-total-count', [], deployer.address).result,
      'u5'
    );
  },
});
