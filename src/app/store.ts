import { configureStore } from '@reduxjs/toolkit';
import balanceReducer from '../components/stacks/balance/balanceSlice';
import accountReducer from '../components/stacks/account/accountSlice';

export const store = configureStore({
  reducer: {
    balance: balanceReducer,
    account: accountReducer
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loggerMiddleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
