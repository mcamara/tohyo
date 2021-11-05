import { useAppSelector } from "../../../app/hooks";

export default function Balances() {
  const balances = useAppSelector(state => state.balance.data);

  return (
    <div>
      {
        Object.values(balances).map((balance) => (
          <div key={balance.token.contractName}>--{balance.token.name}--{balance.balance}</div>
        ))
      }
    </div>
  )
}

