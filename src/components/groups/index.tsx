import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { Group } from "../../app/types";
import ErrorScreen from "../error-screen";
import LoadingScreen from "../loading-screen";
import { getOwnedGroups } from "./groupSlice";

const GroupsIndex = (props: any) => {
  const dispatch = useAppDispatch();
  const groups: Array<Group> = useAppSelector(state => Object.values(state.groups.groups));
  const groupLoading = useAppSelector(state => state.groups.loadingState);
  const account = useAppSelector((state) => state.account.data);

  useEffect(() => {
    if (account?.address || groupLoading === 'LOADING') dispatch(getOwnedGroups(account));
  })

  const render = () => {
    switch (groupLoading) {
      case "LOADING": return <LoadingScreen />;
      case "ERROR": return <ErrorScreen />;
      default: return (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {groups && groups.length > 0
            ?
            groups.map((group) => (
              <li
                key={group.id}
                className="flex flex-col col-span-1 text-center bg-white divide-y divide-gray-200 rounded-lg shadow"
              >
                <NavLink to={`/groups/${group.id}`}>
                  <div className="flex flex-col flex-1 p-8">
                    <img
                      className="flex-shrink-0 w-32 h-32 mx-auto rounded-full"
                      src={`http://lorempixel.com/300/300/abstract/${group.id}`}
                      alt={group.name}
                    />
                    <h3 className="mt-6 text-sm font-medium text-gray-900">{group.name}</h3>
                    <dl className="flex flex-col justify-between flex-grow mt-1">
                      <dt className="sr-only">Title</dt>
                      <dd className="text-sm text-gray-500">sssssssssssss</dd>
                      <dt className="sr-only">Role</dt>
                      <dd className="mt-3">
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          ffffffffffffffffff
                        </span>
                      </dd>
                    </dl>
                  </div>
                </NavLink>
              </li>
            ))
            :
            <div> No groups created yet</div>
          }
        </ul>
      );
    }
  }

  return render();
}

export default GroupsIndex;
