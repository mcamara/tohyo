import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account } from "../../../app/types";
import { getBtcDomain, getCurrentBlock } from "../../../lib/stacks/auth";

type AccountLoadingState = "LOADING" | "READY" | "ERROR" | "NOT_LOGGED_IN";

export interface AccountState {
  data: Account,
  currentBlock: number,
  loading: AccountLoadingState
}

const initialState: AccountState = {
  data: { address: undefined, image: undefined, name: undefined },
  currentBlock: 0,
  loading: "LOADING",
}

export const getAccountDomain = createAsyncThunk(
  "account/data/domain",
  async (address: string | undefined): Promise<string> => {
    if (!address) return '';
    return await getBtcDomain(address);
  }
)

export const getCurrentBlockNumber = createAsyncThunk(
  "account/block/last",
  async (): Promise<number> => {
    return await getCurrentBlock();
  }
)

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    receivedAccount(state, action: PayloadAction<Account>) {
      state.data = action.payload;
    },
  },
  extraReducers: function (builder) {
    builder.addCase('account/data/loading', (state, _) => {
      state.loading = "LOADING";
    });
    builder.addCase('account/data/loaded', (state, _) => {
      state.loading = state.data.address ? "READY" : "NOT_LOGGED_IN";
    });
    builder.addCase('accounts/logOut', (state) => {
      state.data = {
        address: undefined, image: undefined, name: undefined, domain: undefined
      }
      state.loading = "NOT_LOGGED_IN"
    });
    builder.addCase(getAccountDomain.fulfilled, (state, action: PayloadAction<string>) => {
      state.data.domain = action.payload;
    });
    builder.addCase(getCurrentBlockNumber.fulfilled, (state, action: PayloadAction<number>) => {
      state.currentBlock = action.payload;
    });
  }
});

export const { receivedAccount } = accountSlice.actions;
export default accountSlice.reducer;
