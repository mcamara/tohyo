import { configureStore } from '@reduxjs/toolkit';
import balanceReducer from '../components/stacks/balance/balanceSlice';
import accountReducer from '../components/stacks/account/accountSlice';
import groupBalancer from '../components/groups/groupSlice';
import proposalBalancer from '../components/proposals/proposalSlice';

export const store = configureStore({
  reducer: {
    balance: balanceReducer,
    account: accountReducer,
    groups: groupBalancer,
    proposals: proposalBalancer
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
