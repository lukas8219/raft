import type { AppendEntriesRPC, AppendEntriesRPCResponse, CandidateState, FollowerState, LeaderState, RaftStateMachine, RaftStateMachineCandidate, RaftStateMachineFollower, RaftStateMachineLeader, RequestVoteRPC, RequestVoteRPCResponse, ServerState, ServerUuid, Term } from './types.ts';
const INITIAL_STATE: Omit<ServerState, 'serverUuid' | 'votedFor'> = {
  lastAppliedIndex: 0,
  commitIndex: 0,
  currentTerm: 1,
  logs: [],
}

export class RaftBaseClass implements RaftStateMachine {
  constructor(protected state: ServerState) { }
  async appendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    throw new Error('not implemented');
  }
  async handleAppendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    throw new Error('not implemented');
  }
  async requestVote(): Promise<RequestVoteRPCResponse> {
    throw new Error('not implemented');
  }

  async handleRequestVote(request: RequestVoteRPC): Promise<RequestVoteRPCResponse> {
    throw new Error('not implemented');
  }

  async handleHeartbeat(): Promise<boolean> {
    return true;
  }

  async heartbeat(): Promise<AppendEntriesRPCResponse> {
    return { success: false, term: this.state.currentTerm }
  }
}

export class RaftLeaderState extends RaftBaseClass {
  constructor(state: LeaderState) {
    super(state);
  }
  async appendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    return { success: true, term: this.state.currentTerm }
  }
}

export class RaftFollowerState extends RaftBaseClass {
  constructor(state: FollowerState) {
    super(state);
  }
  async handleAppendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    return { success: false, term: this.state.currentTerm }
  }
}

export class RaftCandidateState extends RaftBaseClass {
  constructor(state: CandidateState) {
    super(state);
  }
  async requestVote(): Promise<RequestVoteRPCResponse> {
    return { success: true, voteGranted: false }
  }
}

export class RaftServer implements RaftStateMachine {
  private state: RaftStateMachine;
  constructor(serverUuid: ServerUuid) {
    this.state = new RaftCandidateState({
      ...INITIAL_STATE,
      serverUuid,
      votedFor: '',
    })
  }

  async appendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    return this.state.appendEntries(request);
  }
  async handleAppendEntries(request: AppendEntriesRPC): Promise<AppendEntriesRPCResponse> {
    return this.state.handleAppendEntries(request);
  }
  async requestVote(): Promise<RequestVoteRPCResponse> {
    return this.state.requestVote();
  }

  async handleRequestVote(request: RequestVoteRPC): Promise<RequestVoteRPCResponse> {
    return this.state.handleRequestVote(request);
  }

  async handleHeartbeat(): Promise<boolean> {
    return this.state.handleHeartbeat()
  }

  async heartbeat(): Promise<AppendEntriesRPCResponse> {
    return this.state.heartbeat()
  }
}
