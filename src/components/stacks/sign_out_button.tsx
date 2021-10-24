import { userSession } from "../../lib/stacks/auth";
import { Menu } from '@headlessui/react';
import { useAppDispatch } from "../../app/hooks";

export default function SignOutButton() {
  const dispatch = useAppDispatch();
  const signOut = (e: any) => {
    e.preventDefault();
    userSession.signUserOut();
    dispatch({ type: 'accounts/logOut' })
  }

  return (
    <Menu.Item key="Logout">
      <button
        onClick={(e: any) => signOut(e)}
        className="block px-4 py-2 text-sm text-gray-700"
      >
        Logout
      </button>
    </Menu.Item>
  )
}
