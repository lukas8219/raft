
import type { AppendEntriesRPC, AppendEntriesRPCResponse, RequestVoteRPCResponse, LeaderState, FollowerState, CandidateState } from './types.js'
import { RaftBaseClass } from './base-class.js';

export class RaftLeaderState extends RaftBaseClass {
  constructor(state: LeaderState) {
    super(state);
  }
  async appendEntries(_request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    return { success: true, term: this.state.currentTerm }
  }
}

export class RaftFollowerState extends RaftBaseClass {
  constructor(state: FollowerState) {
    super(state);
  }
  async handleAppendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    const log = this.state.logs[request.prevLogIndex]
    const logsStateMatches = log?.term === request.prevLogTerm;
    const logsStateDiffer = log && log.term !== request.prevLogTerm;

    if (!logsStateMatches) {
      return { success: false, term: this.state.currentTerm } //TODO: it might be interesting to abstract the `currentTerm` exchange here
    }
    if (logsStateDiffer) {
      //Delete log at index and apply current one. Previous log was from state/invalid leader
      //everything that follows it
      this.state.logs.splice(request.prevLogIndex)
    }
    //4. Append any new entries not already in the log - does it mean I need to do a full scan????? - page 4
    // Or should I apply the Log Matching Property here?
    let indexOfNewEntry = Number.MAX_SAFE_INTEGER; // Not sure initializing to 0 is a good idea!
    for (let i = request.prevLogIndex; i <= request.logs.length; i++) {
      const tmpLog = request.logs[i];
      if (!tmpLog) {
        //Protocol failure?
        throw new Error('protocol failure!!!'); // Log? And success: false?
      }
      this.state.logs[i] = tmpLog
      if (!this.state.logs[i]) indexOfNewEntry = i;
    }
    if (request.leaderCommit > this.state.commitIndex) {
      this.state.commitIndex = Math.min(request.leaderCommit, indexOfNewEntry)
    }
    return { success: true, term: this.state.currentTerm }
  }
}

export class RaftCandidateState extends RaftBaseClass {
  constructor(state: CandidateState) {
    super(state);
  }
  async requestVote(): Promise<RequestVoteRPCResponse> {
    if (this.state.votedFor !== null) { }
    return { success: true, voteGranted: false }
  }
}
