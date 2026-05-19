import type { RaftStateMachine, AppendEntriesRPC, AppendEntriesRPCResponse, ServerState, RequestVoteRPC, RequestVoteRPCResponse, Term } from './types.js'
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

  protected updateTerm(request: { term: Term }) {
    this.state.currentTerm = request.term
  }
}
