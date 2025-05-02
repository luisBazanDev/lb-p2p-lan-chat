export enum TCPMessageType {
  HELLO = "HELLO",
  PING = "PING",
  MESSAGE = "MESSAGE",
  PING_RESPONSE = "PING_RESPONSE",
}

export type TCPMessageHelloPayload = {
  username: string;
};

export type TCPMessagePingPayload = {};

export type TCPMessagePingResponsePayload = {};

export type TCPMessageMessagePayload = {
  username: string;
  message: string;
  ttl: number;
  uuid: string;
  system?: boolean;
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
