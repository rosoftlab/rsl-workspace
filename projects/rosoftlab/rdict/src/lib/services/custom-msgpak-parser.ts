import * as msgpack from '@msgpack/msgpack';

export class CustomParser {
  encode(packet: any) {
    const transformedPacket = this.transformDatesForEncoding(packet);
    return msgpack.encode(transformedPacket);
  }

  decode(packet: ArrayBuffer) {
    const decodedPacket = msgpack.decode(packet);
    return this.transformDatesForDecoding(decodedPacket);
  }

  private transformDatesForEncoding(packet: any): any {
    if (packet instanceof Date) {
      return { __type: 'Date', value: packet.toISOString() };
    }
    if (Array.isArray(packet)) {
      return packet.map((item) => this.transformDatesForEncoding(item));
    }
    if (typeof packet === 'object' && packet !== null) {
      const result: any = {};
      for (const key in packet) {
        result[key] = this.transformDatesForEncoding(packet[key]);
      }
      return result;
    }
    return packet;
  }

  private transformDatesForDecoding(packet: any): any {
    if (packet && packet.__type === 'Date') {
      return new Date(packet.value);
    }
    if (Array.isArray(packet)) {
      return packet.map((item) => this.transformDatesForDecoding(item));
    }
    if (typeof packet === 'object' && packet !== null) {
      const result: any = {};
      for (const key in packet) {
        result[key] = this.transformDatesForDecoding(packet[key]);
      }
      return result;
    }
    return packet;
  }
}