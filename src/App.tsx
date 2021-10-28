/* This example requires Tailwind CSS v2.0+ */
import { Disclosure } from '@headlessui/react';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';

import UserMenu from './components/user-menu';
import Balances from './components/stacks/balance/balances';
import NewGroupPage from './components/groups/new';
import { useEffect } from 'react';
import { getAccount } from './lib/stacks/auth';
import { getAccountDomain, receivedAccount } from './components/stacks/account/accountSlice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { getAccountBalances } from './components/stacks/balance/balanceSlice';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

const user = {
  name: 'Tom Cook',
  email: 'tom@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'New Group', href: '/groups/new' },
]
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

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
      <div className="min-h-screen bg-white">
        <Disclosure as="nav" className="bg-white border-b border-gray-200">
          {({ open }) => (
            <>
              <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex items-center flex-shrink-0">
                      <img
                        className="block w-auto h-8 lg:hidden"
                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
                        alt="Workflow"
                      />
                      <img
                        className="hidden w-auto h-8 lg:block"
                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"
                        alt="Workflow"
                      />
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
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
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <button
                      type="button"
                      className="p-1 text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                    <UserMenu />
                  </div>
                  <div className="flex items-center -mr-2 sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XIcon className="block w-6 h-6" aria-hidden="true" />
                      ) : (
                        <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <NavLink exact
                      key={item.name}
                      to={item.href}
                      activeClassName="bg-indigo-50 border-indigo-500 text-indigo-700"
                      className='block py-2 pl-3 pr-4 text-base font-medium text-gray-600 border-l-4 border-transparent hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                      aria-current='page'
                    >
                      {item.name}
                    </NavLink>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img className="w-10 h-10 rounded-full" src={user.imageUrl} alt="" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user.email}</div>
                    </div>
                    <button
                      type="button"
                      className="flex-shrink-0 p-1 ml-auto text-gray-400 bg-white rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10">
          <Switch>
            <Route path="/groups/new">
              <NewGroupPage />
            </Route>
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
        </div>
      </div>
    </Router>
  )
}
