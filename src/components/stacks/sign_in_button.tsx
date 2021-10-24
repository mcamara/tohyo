import { authenticate } from "../../lib/stacks/auth";

const SignInButton = (props: any) => {
  return (
    <button
      onClick={authenticate}
      className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Connect Wallet
    </button>
  )
}

export default SignInButton;
