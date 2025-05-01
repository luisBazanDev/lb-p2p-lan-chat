export enum TCPMessageType {
  HELLO,
  PING,
  MESSAGE,
  PING_RESPONSE,
}

export type TCPMessageHelloPayload = {};

export type TCPMessagePingPayload = {};

export type TCPMessagePingResponsePayload = {};

export type TCPMessageMessagePayload = {
  username: string;
  message: string;
  ttl: number;
  hash: string;
};

export type TCPMessage =
  | {
      type: TCPMessageType;
      payload: any;
    }
  | {
      type: TCPMessageType.HELLO;
      payload: TCPMessageHelloPayload;
    }
  | {
      type: TCPMessageType.PING;
      payload: TCPMessagePingPayload;
    }
  | {
      type: TCPMessageType.PING_RESPONSE;
      payload: TCPMessagePingResponsePayload;
    }
  | {
      type: TCPMessageType.MESSAGE;
      payload: TCPMessageMessagePayload;
    };
