import { Duplex } from 'node:stream'
import BinaryProtocol from 'binary-protocol'
import { EventEmitter, once } from 'node:events';

const AppendEntriesOpCode = 1;
// export type AppendEntriesRPC = {
//   term: Term;
//   leaderId: ServerUuid;
//   prevLogIndex: Index;
//   prevLogTerm: Term;
//   logs: LogEntry[];
//   leaderCommit: Index;
// }

const RPCProtocol = new BinaryProtocol();
RPCProtocol.define('AppendEntries', {
  read: function(data: Record<string, unknown>) {
    this
      .Int32BE('status')
      .tap(function(data: Record<string, unknown>) {
        if (data.status === 0) {
          //@ts-ignore
          return this.String('error');
        }
        else {
          //@ts-ignore
          return this
            .String('nickname')
            .Int32BE('totalUnreadMessages');
        }
      });
  },
  write: function writeByte(data: Record<string, unknown>) {
    this
      .Int32BE(AppendEntriesOpCode) // op code
      .String(data.term)
      .String(data.leaderId)
      .String(data.prevLogIndex)
      .String(data.prevLogTerm)
      .String(data.leaderCommit)
      .String(data.logs)
  }
})

type Server = {
  stream: Duplex;
  seqno: number;
}

export class RpcControlPlane {
  //@ts-ignore need the binary-protocol.d.ts
  constructor(private readonly servers: Map<string, any>) { }

  static async withConfiguration(servers: Map<string, Server>) {
    const commanders = new Map<string, any>();
    for (const [uuid, server] of servers) {
      commanders.set(uuid, RPCProtocol.createCommander(server.stream));
    }
    const cp = new RpcControlPlane(commanders);
    return cp;
  }

  async sendCommand(serverId: string, command: string, args: string) {
    //register handler for event
    const target = this.servers.get(serverId); //What is the failure mode here? Empty Duplex?
    if (!target) throw new Error('server id does not exist in map')
    target.AppendEntries({})
    //wait for incoming
  }
}
