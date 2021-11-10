import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Balance, Option, Proposal } from "../../app/types";
import ErrorScreen from "../error-screen";
import LoadingScreen from "../loading-screen";
import { getProposal } from "./proposalSlice";
import { RadioGroup } from '@headlessui/react';
import classNames from "classnames";
import { getCurrentBlockNumber } from "../stacks/account/accountSlice";
import { vote } from "../../lib/stacks/proposal";
import { getAccountBalances } from "../stacks/balance/balanceSlice";

interface stateType {
  selected: Option | undefined
}

const ShowProposalPage = (props : any) => {
  const { id } = props.match.params;
  const dispatch = useAppDispatch();
  const proposal : Proposal | undefined = useAppSelector(state => state.proposals.proposals[id]);
  const loading = useAppSelector(state => state.proposals.loadingState);
  const balance: Balance | undefined = useAppSelector(state => proposal?.token ? state.balance.data[`${proposal.token.address}::${proposal.token.contractName}`] : undefined)
  const currentBlockNumber: number | undefined = useAppSelector(state => state.account.currentBlock);
  const address = useAppSelector(state => state.account.data.address);

  const [state, setState] = useState<stateType>({
    selected: undefined
  });

  useEffect(() => {
    if (loading !== 'LOADED') dispatch(getProposal(id));
    if (!currentBlockNumber) dispatch(getCurrentBlockNumber());
    if (address && !balance) dispatch(getAccountBalances(address));
  })

  const setSelected = (option : Option) => {
    setState({ selected: option });
  }

  const votingEnabled = (): boolean => {
    return currentBlockNumber < proposal.finishAt && state.selected !== undefined;
  }

  const voteButtonPressed = (event: any) => {
    event.preventDefault();
    if (!state.selected || !balance?.balance) return;
    vote(proposal, state.selected, balance.balance, () => {}, () => {});
  }

  const render = () => {
    switch (loading) {
      case "LOADING": return <LoadingScreen />;
      case "ERROR": return <ErrorScreen />;
      default: return (
        <div>
          <header>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">{proposal.title}</h1>
            </div>
          </header>
          <main className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg sm:my-6 lg:my-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Description</h3>
                <p className="mt-1 text-sm text-gray-500">{proposal.description}</p>
                <h4 className="mt-3 font-medium leading-6 text-gray-900 text-m">Total tokens allocated: {proposal.totalVotes} {proposal.token.symbol}</h4>
                <div className="mt-3">
                  <a href={`https://ipfs.infura.io:5001/api/v0/cat?arg=${proposal.hash}`} className="mt-3 text-m">Link to IPFS statement</a>
                </div>
              </div>
            </div>
            <div className="mx-auto max-w-7xl">
              <h3 className="text-xl font-bold leading-tight text-gray-900">Options</h3>
            </div>
            <RadioGroup value={state.selected} onChange={setSelected} className="mt-4">
              <RadioGroup.Label className="sr-only">Option chosen</RadioGroup.Label>
              <div className="space-y-4">
                {proposal.options.map((option) => (
                  <RadioGroup.Option
                    key={option.order}
                    value={option}
                    className={({ checked, active }) =>
                      classNames(
                        checked ? 'border-transparent' : 'border-gray-300',
                        active ? 'ring-2 ring-indigo-500' : '',
                        'relative block bg-white border rounded-lg shadow-sm px-6 py-4 cursor-pointer sm:flex sm:justify-between focus:outline-none'
                      )
                    }
                  >
                    {({ active, checked }) => (
                      <>
                        <div className="flex items-center">
                          <div className="text-sm">
                            <RadioGroup.Label as="p" className="font-medium text-gray-900">
                              {option.order} - {option.description}
                            </RadioGroup.Label>
                            <RadioGroup.Description as="div" className="text-gray-500">
                              <p className="sm:inline">
                                Votes allocated: {option.totalVotes} {proposal.token.symbol}
                              </p>{' '}
                              {/* <span className="hidden sm:inline sm:mx-1" aria-hidden="true">
                                &middot;
                              </span>{' '}
                              <p className="sm:inline">% of votes</p> */}
                            </RadioGroup.Description>
                          </div>
                        </div>
                        <RadioGroup.Description as="div" className="flex mt-2 text-sm sm:mt-0 sm:block sm:ml-4 sm:text-right">
                          <div className="font-medium text-gray-900">
                            { proposal.totalVotes > 0 ? (option.totalVotes * 100) / proposal.totalVotes : '0' }%
                          </div>
                        </RadioGroup.Description>
                        <div
                          className={classNames(
                            active ? 'border' : 'border-2',
                            checked ? 'border-indigo-500' : 'border-transparent',
                            'absolute -inset-px rounded-lg pointer-events-none'
                          )}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </div>
            </RadioGroup>
            <div className="pt-5">
              <div className="flex justify-end">
                {currentBlockNumber >= proposal.finishAt
                  ?
                  <button
                    className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    disabled={true}
                  >
                    Voting finished at block {proposal.finishAt}
                  </button>
                  :
                  <button
                    className={`inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${!votingEnabled() ? 'disabled:opacity-50' : ''}`}
                    disabled={!votingEnabled()}
                    onClick={voteButtonPressed}
                  >
                    {balance?.token
                    ?
                    `Vote with ${balance?.token.name} (${balance?.balance} ${balance?.token.symbol})`
                    :
                    `Not enough ${proposal.token.symbol} available`
                    }
                  </button>
                }
              </div>
            </div>
          </main>
        </div>
      )
    }
  }

  return render();
}

export default ShowProposalPage;
