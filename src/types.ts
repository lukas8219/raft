export type LogEntry = {
}
export type Term = BigInteger
export type Index = BigInteger

export type LeaderState = {
  currentTerm: Term;

  entries: LogEntry[];
  currentIndex: Index;

  committedIndex: Index;
  lastAppliedIndex: Index;

  followers: {
    serverUid: string; //How to identify? Should we <T> ?
    nextIndex: Index;
    nextMatchIndex: Index;
  }[]
}
export type FollowerState = {
  currentTerm: Term;
  entries: LogEntry[]
  currentIndex: Index;
}
export type CandidateState = {
  currentTerm: Term;
  entries: LogEntry[];
  currentIndex: Index;
}


/* RPC! */

export type RequestVoteRPC = {
  term: Term
}
export type RequestVoteRPCResponse = {
  success: boolean
}
export type AppendEntriesRPC = {
  term: Term;
}
export type AppendEntriesRPCResponse = {
  success: boolean
}

export interface RaftStateMachineLeader {
  appendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse>
}

export interface RaftStateMachineFollower {
  handleAppendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse>
}

export interface RaftStateMachineCandidate {
  requestVote(): Promise<RequestVoteRPCResponse>
}

export interface RaftStateMachineServer {
  heartbeat(): Promise<AppendEntriesRPCResponse>
  handleHeartbeat(): Promise<boolean>
  handleRequestVote(request: RequestVoteRPC): Promise<RequestVoteRPCResponse>
}

export interface RaftStateMachine extends RaftStateMachineLeader, RaftStateMachineCandidate, RaftStateMachineFollower { }
