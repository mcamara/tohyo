import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Group, Proposal } from "../../app/types";
import ErrorScreen from "../error-screen";
import LoadingScreen from "../loading-screen";
import { getGroupProposals } from "../proposals/proposalSlice";
import { getSingleGroups } from "./groupSlice";

const ShowGroupPage = (props : any) => {
  const { id } = props.match.params;
  const dispatch = useAppDispatch();
  const group : Group | undefined = useAppSelector(state => state.groups.groups[id]);
  const proposals : Array<Proposal> | undefined = useAppSelector(state => state.proposals.groupProposals[group?.id]);
  const groupLoading = useAppSelector(state => state.groups.loadingState);
  const proposalsLoading = useAppSelector(state => state.proposals.loadingState);
  const address : string | undefined = useAppSelector(state => state.account.data.address);

  useEffect(() => {
    if (id && groupLoading === 'LOADING') dispatch(getSingleGroups(id));
    if (group && groupLoading === 'LOADED') dispatch(getGroupProposals(group));
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
                  <>
                    { proposals && proposals.length > 0
                      ?
                      Object.values(proposals).map((proposal) => (
                        <div key={proposal.id}>{proposal.title}</div>
                      ))
                      :
                      <div> This group has no proposals yet</div>
                    }
                  </>
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
