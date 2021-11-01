import { useAppDispatch } from "../../app/hooks";
import { authenticate, getAccount } from "../../lib/stacks/auth";
import { receivedAccount } from "./account/accountSlice";

const SignInButton = (props: any) => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    authenticate(() => { dispatch(receivedAccount(getAccount())) })
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Connect Wallet
    </button>
  )
}

export default SignInButton;
