import { CalendarIcon, TagIcon } from "@heroicons/react/solid";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Group, Proposal } from "../../app/types";
import ErrorScreen from "../error-screen";
import LoadingScreen from "../loading-screen";
import { getGroupProposals } from "../proposals/proposalSlice";
import { getCurrentBlockNumber } from "../stacks/account/accountSlice";
import { getSingleGroups } from "./groupSlice";

const ShowGroupPage = (props : any) => {
  const { id } = props.match.params;
  const dispatch = useAppDispatch();
  const group : Group | undefined = useAppSelector(state => state.groups.groups[id]);
  const proposals : Array<Proposal> | undefined = useAppSelector(state => state.proposals.groupProposals[group?.id]);
  const groupLoading = useAppSelector(state => state.groups.loadingState);
  const proposalsLoading = useAppSelector(state => state.proposals.loadingState);
  const address: string | undefined = useAppSelector(state => state.account.data.address);
  const currentBlockNumber: number | undefined = useAppSelector(state => state.account.currentBlock);

  useEffect(() => {
    if (id && groupLoading === 'LOADING') dispatch(getSingleGroups(id));
    if (group?.id && proposalsLoading !== 'LOADED') dispatch(getGroupProposals(group));
    if (!currentBlockNumber) dispatch(getCurrentBlockNumber());
  })

  const render = () => {
    switch (groupLoading) {
      case "LOADING": return <LoadingScreen />;
      case "ERROR": return <ErrorScreen />;
      default: return (
        <div>
          <header>
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">{group.name}</h1>
            </div>
          </header>
          <main className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="overflow-hidden bg-white shadow sm:rounded-lg sm:my-6 lg:my-8">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Proposals</h3>
                <p className="max-w-2xl mt-1 text-sm text-gray-500">Proposals from this group.</p>
              </div>
              <div className="px-4 py-5 border-t border-gray-200 sm:px-6">
                { proposalsLoading === 'LOADING'
                  ?
                    <div>LOADING</div>
                  :
                  proposals && proposals.length > 0
                    ?
                      <ul className="divide-y divide-gray-200">
                        {Object.values(proposals).map((proposal) => (
                          <li key={proposal.id}>
                              <NavLink to={`/proposals/${proposal.id}`} key={proposal.id}>
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-indigo-600 truncate">{proposal.title}</p>
                                  <div className="flex flex-shrink-0 ml-2">
                                    <p className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${currentBlockNumber < proposal.finishAt ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                                      {currentBlockNumber < proposal.finishAt ? 'Open' : 'Closed'}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between">
                                  <div className="sm:flex">
                                    <p className="flex items-center text-sm text-gray-500">
                                      <TagIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                      {proposal.totalVotes} {proposal.token.symbol} allocated
                                    </p>
                                  </div>
                                  <div className="flex items-center mt-2 text-sm text-gray-500 sm:mt-0">
                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                                    <p>
                                      Closing on block {proposal.finishAt}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                      :
                      <div> This group has no proposals yet</div>
                    }
              </div>
            </div>
            {address && group.admins.includes(address) &&
              <div className="overflow-hidden bg-white shadow sm:rounded-lg sm:my-6 lg:my-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Admin</h3>
                  <p className="max-w-2xl mt-1 text-sm text-gray-500">You can manage your group here.</p>
                </div>
                <div className="px-4 py-5 border-t border-gray-200 sm:px-6">
                  <NavLink
                    to={ `/groups/${id}/proposals/new`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create proposal
                  </NavLink>
                </div>
              </div>
            }
            {address && group.owner === address &&
              <div className="overflow-hidden bg-white shadow sm:rounded-lg sm:my-6 lg:my-8">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Owner</h3>
                  <p className="max-w-2xl mt-1 text-sm text-gray-500">You can add and remove users to the group from here.</p>
                </div>
                <div className="px-4 py-5 border-t border-gray-200 sm:px-6">
                  To be done, clarity contract is ready for this. :)
                </div>
              </div>
            }
          </main>
        </div>
      )
    }
  }

  return render();
}

export default ShowGroupPage;
