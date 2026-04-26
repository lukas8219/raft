export type LogEntry = {
}
export type Term = Number;
export type Index = Number;
export type ServerUuid = string;

export type PersistentState = {
  currentTerm: Term;
  logs: LogEntry[];
  votedFor?: ServerUuid;
}

export type VolatileState = {
  serverUuid: string;
  commitIndex: Index;
  lastAppliedIndex: Index;
}

export type ServerState = VolatileState & PersistentState

export type LeaderState = {
  followers: {
    serverUid: ServerUuid; //How to identify? Should we <T> ?
    nextIndex: Index;
    matchIndex: Index;
  }[]
} & ServerState;

export type FollowerState = ServerState;
export type CandidateState = ServerState;


/* RPC! */

export type AppendEntriesRPC = {
  term: Term;
  leaderId: ServerUuid;
  prevLogIndex: Index;
  prevLogTerm: Term;
  logs: LogEntry[];
}
export type AppendEntriesRPCResponse = {
  success: boolean
  term: Term;
}
export type RequestVoteRPC = {
  term: Term
  candidateId: ServerUuid;
  lastLogIndex: Index;
  lastLogTerm: Term;
}
export type RequestVoteRPCResponse = {
  success: boolean
  voteGranted: boolean;
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

export interface RaftStateMachine extends RaftStateMachineLeader, RaftStateMachineCandidate, RaftStateMachineFollower, RaftStateMachineServer { }
