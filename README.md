# tohyo.xyz　投票

[![Netlify Status](https://api.netlify.com/api/v1/badges/e892ae8c-48a2-46fc-a7f0-23bbf744469b/deploy-status)](https://app.netlify.com/sites/keen-noether-76ff67/deploys)

# Testing the app:

- [testnet.tohyo.xyz](testnet.tohyo.xyz) -> This is the testnet platform, please report bugs by creating issues in this repo.

In order to create groups and proposals, you'll need to get STX from the faucet.
In order to vote, you'll need one of the supported tokens in the testnet (DIKO, stDIKO and USDA at the moment).

# About tohyo

Tohyo (vote in Japanese) is basically a decentralized voting system running on stacks. It provides flexibility when creating proposals allowing the user to...

- Choose different SIP010 tokens to allocate votes for an option (DIKO, stDIKO and USDA for the testnet, more tokens coming in the future)
- Personalizing a proposal with different options and ways to vote
- Adding a time limit to vote (based on blocks)
- Creating groups that can be managed by multiple accounts. These groups will be able to create and manage proposals.
- Clarity tests for the contracts are available

It's basically an implementation of [https://snapshot.org](https://snapshot.org) running in stacks.

# What's left to be done?

As this was a project for a hackaton, lots of things were missed when it was first deployed. This list includes the next ideas:

- LOTS OF UI/UX improvements (there are no notifications right now and some transitions are clunky)
- Block tokens when an user vote.
- Accept multiple tokens for the same proposal (stDIKO and DIKO could be used in the same proposal).
- Use SIP009 (NFT tokens) to be counted as voting power.
- Vote to multiple options for the same proposal.
- Tests for react components - Clarity contracts have tests that can be executed running `yarn clarinet:test` and live in the `contracts/tests` folder.
- Tracker for the transactions, we can even show a notification when your vote function has been processed correctly and the transaction has been confirmed.

# Tech stack

- IPFS (using infura.io) to save proposal details.
- React
- Clarity
- Netlify
