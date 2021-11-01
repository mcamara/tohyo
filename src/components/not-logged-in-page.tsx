import SignInButton from "./stacks/sign_in_button";
import { LinkIcon } from '@heroicons/react/solid';

export default function NotLoggedInPage() {
  return (
    <div className="text-center">
      <LinkIcon className="w-12 h-12 mx-auto text-gray-400"/>

      <h3 className="mt-2 text-sm font-medium text-gray-900">Connect your Hiro Wallet ({ process.env.REACT_APP_NETWORK_ENV })</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by connecting your account.</p>
      <div className="mt-6">
        <SignInButton />
      </div>
    </div>
  )
};
