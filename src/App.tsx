/* This example requires Tailwind CSS v2.0+ */
import { Disclosure } from '@headlessui/react';

import UserMenu from './components/user-menu';
import Balances from './components/stacks/balance/balances';
import NewGroupPage from './components/groups/new';
import ShowGroupPage from './components/groups/show';
import { useEffect } from 'react';
import { getAccount } from './lib/stacks/auth';
import { getAccountDomain, receivedAccount } from './components/stacks/account/accountSlice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getAccountBalances } from './components/stacks/balance/balanceSlice';
import NotLoggedInPage from './components/not-logged-in-page';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";
import NewProposalPage from './components/proposals/new';

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'New Group', href: '/groups/new' },
]

export default function App() {
  const dispatch = useAppDispatch();
  const address = useAppSelector(state => state.account.data.address);

  useEffect(() => {
    dispatch(receivedAccount(getAccount()));
    if (address) {
      dispatch(getAccountBalances(address));
      dispatch(getAccountDomain(address));
    }
  })

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Disclosure as="nav" className="bg-white border-b border-gray-200">
          {() => (
            <>
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex items-center flex-shrink-0">
                      {/* <img
                        className="block w-auto h-8 lg:hidden"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                      />
                      <img
                        className="hidden w-auto h-8 lg:block"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"
                        alt="Workflow"
                      /> */}
                      <h1 className="font-bold">
                        TOHYO
                      </h1>
                    </div>
                    <div className="flex ml-6 -my-px sm:space-x-8">
                      {navigation.map((item) => (
                        <NavLink exact
                          key={item.name}
                          to={item.href}
                          activeClassName="border-indigo-500 text-gray-900"
                          className='inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:border-gray-300 hover:text-gray-700'
                          aria-current='page'
                        >
                          {item.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center ml-6">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          {address
            ?
            <Switch>
              <Route path="/groups/new" component={NewGroupPage} />
              <Route path="/groups/:id/proposals/new" component={NewProposalPage} />
              <Route path="/groups/:id" component={ShowGroupPage} />
              <Route path="/">
                <header>
                  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold leading-tight text-gray-900">Dashboard</h1>
                  </div>
                </header>
                <main>
                  <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Replace with your content */}
                    <div className="px-4 py-8 sm:px-0">
                      <Balances />
                      <div className="border-4 border-gray-200 border-dashed rounded-lg h-96" />
                    </div>
                    {/* /End replace */}
                  </div>
                </main>
              </Route>
            </Switch>
            :
            <NotLoggedInPage />
          }
        </div>
      </div>
    </Router>
  )
}
