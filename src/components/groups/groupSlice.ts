import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Account, Group } from "../../app/types";
import { getAllGroups, getGroupsByAccount, getGroupsById } from "../../lib/stacks/group";

type GroupsLoadingState = "NOT_LOGGED_IN" | "LOADING" | "LOADED" | "ERROR";
export interface GroupState {
  groupsAdmin: Array<Group>,
  loadingState: GroupsLoadingState,
  groups: { [id: number]: Group },
}

const initialState: GroupState = {
  groupsAdmin: [],
  loadingState: "LOADING",
  groups: {}
}

export const getOwnedGroups = createAsyncThunk(
  "account/groups_admin",
  async (account: Account | undefined) => {
    if (!account) return [];

    return await getGroupsByAccount(account);
  }
)

export const getSingleGroups = createAsyncThunk(
  "account/groups/singleGroup",
  async (id: number) => {
    return await getGroupsById(id);
  }
)

export const indexGroups = createAsyncThunk(
  "account/groups/all",
  async () => {
    return await getAllGroups();
  }
)

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getSingleGroups.fulfilled, (state, action: PayloadAction<Group>) => {
      const { id } = action.payload;
      if (id.toString() === '0') {
        state.loadingState = "ERROR";
        return;
      }
      state.groups[id] = action.payload;
      state.loadingState = "LOADED";
    });
    builder.addCase(getOwnedGroups.fulfilled, (state, action: PayloadAction<Array<Group>>) => {
      for (const group of action.payload) {
        const { id } = group;
        if (id.toString() === '0') {
          state.loadingState = "ERROR";
          return;
        }
        state.groups[id] = group;
      }
      state.loadingState = "LOADED";
    });
    builder.addCase(getSingleGroups.rejected, (state) => {
      state.loadingState = "ERROR";
    });
    builder.addCase('accounts/logOut', (state) => {
      state.groupsAdmin = [];
      state.loadingState = "NOT_LOGGED_IN";
    });
  }
});

export default groupSlice.reducer;
