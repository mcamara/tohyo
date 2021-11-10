import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Group, Proposal } from "../../app/types";
import { getProposalByGroup, getProposalById } from "../../lib/stacks/proposal";

type GroupsLoadingState = "LOADING" | "LOADED" | "ERROR";
export interface ProposalState {
  proposals: { [id: number]: Proposal },
  groupProposals: { [groupId: number]: Array<Proposal> },
  loadingState: GroupsLoadingState,
}

const initialState: ProposalState = {
  proposals: {},
  loadingState: "LOADING",
  groupProposals: {}
}

export const getGroupProposals = createAsyncThunk(
  "groups/proposals",
  async (group: Group | undefined) => {
    if (!group) return [];
    return await getProposalByGroup(group);
  }
)

export const getProposal = createAsyncThunk(
  "proposal/get",
  async (id: number) => {
    return await getProposalById(id);
  }
)

const proposalSlice = createSlice({
  name: 'proposal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getGroupProposals.fulfilled, (state, action: PayloadAction<Proposal[]>) => {
      state.loadingState = "LOADED";
      if (action.payload.length === 0) return;

      state.groupProposals[action.payload[0].groupId] = [];
      for (let proposal of action.payload) {
        state.proposals[proposal.id] = proposal;
        state.groupProposals[proposal.groupId].push(proposal);
      }
    });
    builder.addCase(getProposal.fulfilled, (state, action: PayloadAction<Proposal>) => {
      const { id } = action.payload;
      if (id.toString() === '0') {
        state.loadingState = "ERROR";
        return;
      }

      state.loadingState = "LOADED";
      state.proposals[id] = action.payload;
    });
  }
});

export default proposalSlice.reducer;
