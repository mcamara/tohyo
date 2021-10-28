import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useAppSelector } from '../app/hooks';
import { RootState } from '../app/store';

import SignInButton from "./stacks/sign_in_button";
import SignOutButton from "./stacks/sign_out_button";

export default function UserMenu() {
  const account = useAppSelector((state: RootState) => state.account.data);

  return (
    <Menu as= "div" className="relative ml-3">
      <div>
        {account.address
          ?
            <Menu.Button className="flex items-center max-w-xs text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">Open user menu</span>
              {String(account.name)} <img className="w-8 h-8 rounded-full" src={account.image} alt="user avatar" />
            </Menu.Button>
          :
            <SignInButton />
        }
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <SignOutButton />
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
