import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Balance } from "../../../app/types";
import { getBalances } from "../../../lib/stacks/balances";

type BalanceLoadingState = "NOT_LOGGED_IN" | "LOADING" | "LOADED";
export interface BalanceState {
  data: { [address: string]: Balance},
  loadingState: BalanceLoadingState,
}

const initialState: BalanceState = {
  data: {},
  loadingState: "LOADING"
}

export const getAccountBalances = createAsyncThunk(
  "account/balances",
  async (address: string | undefined) => {
    if (!address) return [];
    return await getBalances(address);
  }
)
const balanceSlice = createSlice({
  name: 'balances',
  initialState,
  reducers: { },
  extraReducers: (builder) => {
    builder.addCase(getAccountBalances.fulfilled, (state, action: PayloadAction<Balance[]>) => {
      const balances = action.payload;
      balances.forEach(balance => {
        state.data[`${balance.token.address}::${balance.token.contractName}`] = balance;
      });
      state.loadingState = "LOADED";
    });
    builder.addCase('accounts/logOut', (state) => {
      state.data = {};
      state.loadingState = "NOT_LOGGED_IN";
    });
  }
});

export default balanceSlice.reducer;
