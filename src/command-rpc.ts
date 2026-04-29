import { Duplex } from 'node:stream'
import BinaryProtocol from 'binary-protocol'
import { EventEmitter, once } from 'node:events';

const SendCommandRPCProtocol = new BinaryProtocol();
SendCommandRPCProtocol.define('Bytes', {
  read: function(name: Buffer) {
    this
      .pushStack({ length: null, value: null })
      .Int32BE('length')
      .tap(function tapLength(data: any) { // i dont know
        if (data.length === -1) {
          data.value = null;
          return
        }
        // @ts-ignore
        this.raw('value', data.length)
      })
      .popStack(name, function popStackBytes(data: any) {
        return data.value;
      })
  },
  write: function writeByte(value: Buffer) {
    if (value === null) {
      this.Int32BE(-1);
      return
    }
    this.Int32BE(value.length).raw(value)
  }
})


SendCommandRPCProtocol.define('String', {
  read: function(name: string) {
    this.Bytes(name)
      .collect(function(data: any) {
        if (data[name] != null) {
          data[name] = data[name].toString('utf8')
        }
        return data;
      })
  },
  write: function(value: string) {
    this.Bytes(Buffer.from(value, 'utf8'))
  }
})

function writeCommand(stream: Duplex, command: string, args: string) {
  const writer = SendCommandRPCProtocol.createWriter();
  writer.String(command);
  writer.String(args);
  stream.write(writer.buffer);
}

function createReader(stream: Duplex) {
  const reader = SendCommandRPCProtocol.createReader(stream);
  reader.String('command');
  reader.String('args');
  return reader;
}

type Server = {
  stream: Duplex;
  seqno: number;
}

export class RpcControlPlane {
  private readonly servers: Map<string, Server> = new Map();
  private readonly rpcEmitter: EventEmitter = new EventEmitter();

  async sendCommand(serverId: string, command: string, args: string) {
    //register handler for event
    const receiver = this.servers.get(serverId); //What is the failure mode here? Empty Duplex?
    if (!receiver) throw new Error('server id does not exist in map')
    const seqno = ++receiver.seqno;
    const rpcPromise = once(this.rpcEmitter, `${serverId}:${seqno}`) //TODO: AbortSignal for timeouts
    writeCommand(receiver.stream, command, args)
    const response = await rpcPromise;
    //wait for incoming
  }
}
