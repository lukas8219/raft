import type { AppendEntriesRPC, AppendEntriesRPCResponse, CandidateState, FollowerState, LeaderState, RaftStateMachine, RaftStateMachineCandidate, RaftStateMachineFollower, RaftStateMachineLeader, RequestVoteRPC, RequestVoteRPCResponse, ServerState, ServerUuid, Term } from './types.ts';
const INITIAL_STATE: Omit<ServerState, 'serverUuid' | 'votedFor'> = {
  lastAppliedIndex: 0,
  commitIndex: 0,
  currentTerm: 1,
  logs: [],
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
