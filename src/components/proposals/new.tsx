import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import ErrorScreen from "../error-screen";
import { getSingleGroups } from "../groups/groupSlice";
import LoadingScreen from "../loading-screen";
import { useState } from "react";
import { Group } from "../../app/types";
import { acceptedProposalTokens } from "../../lib/stacks/tokens";
import { getCurrentBlockNumber } from "../stacks/account/accountSlice";
import { createProposal } from "../../lib/stacks/proposal";

const NewProposalPage = (props : any) => {
  const { id } = props.match.params;
  const dispatch = useAppDispatch();
  var loading: boolean = false;
  const groupLoading = useAppSelector(state => state.groups.loadingState);
  const group: Group | undefined = useAppSelector(state => state.groups.groups[id]);
  const currentBlockNumber: number | undefined = useAppSelector(state => state.account.currentBlock);

  const [state, setState] = useState({
    title: '',
    description: '',
    contractName: acceptedProposalTokens[0].contractName,
    finishAt: currentBlockNumber
  });

  useEffect(() => {
    if (!currentBlockNumber) dispatch(getCurrentBlockNumber());
    if (id && groupLoading === 'LOADING') {
      dispatch(getSingleGroups(id));
    }
  });

  const handleChange = (event: any) => {
    const value = event.target.value;
    setState({ ...state, [event.target.name]: value });
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (loading) return;
    loading = true;
    const token = acceptedProposalTokens.find((t) => t.contractName === state.contractName);
    if (!token) return; // TODO: Add error

    createProposal({
      id: 0,
      title: state.title,
      description: state.description,
      createdBy: '',
      createdAt: currentBlockNumber,
      finishAt: state.finishAt,
      groupId: group.id,
      token,
      totalVotes: 0
      }, () => {}, (tx) => { console.log(tx); }
    )
  }
  const render = () => {
    switch (groupLoading) {
      case "LOADING": return <LoadingScreen />;
      case "ERROR": return <ErrorScreen />;
      default: return (
        <div>
          <header>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">New proposal ({group.name})</h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="px-4 py-8 sm:px-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Proposal Information</h3>
                      <p className="mt-1 text-sm text-gray-600">Please input the following information to create a proposal.</p>
                    </div>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <form onSubmit={handleSubmit}>
                      <div className="overflow-hidden shadow sm:rounded-md">
                        <div className="px-4 py-5 bg-white sm:p-6">
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="col-span-6">
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Proposal title
                              </label>
                              <input
                                type="text"
                                name="title"
                                id="title"
                                value={state.title}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                onChange={handleChange}
                                placeholder="Proposal title"
                                min="0"
                                max="100"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-5 bg-white sm:p-6">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              name="description"
                              rows={3}
                              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={state.description}
                              onChange={handleChange}
                              placeholder="Add a description for this proposal"
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">Description of the proposal.</p>
                        </div>


                        <div className="px-4 py-5 bg-white sm:p-6 sm:col-span-3">
                          <label htmlFor="contractName" className="block text-sm font-medium text-gray-700">
                            Token to vote
                          </label>
                          <div className="mt-1">
                            <select
                              id="contractName"
                              name="contractName"
                              value={state.contractName}
                              onChange={handleChange}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              {
                                acceptedProposalTokens.map((token) => (
                                  <option value={token.contractName} key={token.contractName}>
                                    {token.name} ({token.symbol})
                                  </option>
                                ))
                              }
                            </select>
                          </div>
                        </div>

                        <div className="px-4 py-5 bg-white sm:p-6">
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="col-span-6">
                              <label htmlFor="finishAt" className="block text-sm font-medium text-gray-700">
                                Finish at (block number). Current block {currentBlockNumber}
                              </label>
                              <input
                                type="number"
                                name="finishAt"
                                id="finishAt"
                                value={state.finishAt}
                                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                onChange={handleChange}
                                placeholder="Block to close the proposal"
                                min={currentBlockNumber + 1}
                                step={1}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="px-4 py-3 text-right bg-gray-50 sm:px-6">
                          <button
                            type="submit"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={loading}
                          >
                            Create
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }
  }

  return render();
}

export default NewProposalPage;
