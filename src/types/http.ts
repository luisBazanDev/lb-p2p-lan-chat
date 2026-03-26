export interface ConnectRequest {
  // Empty body as per MANUAL.md
}

export interface ConnectResponse {
  token: string;
  connectedClients: number;
  maxClients: number;
  nodeId: string;
}

export interface MessagePayload {
  username: string;
  message: string;
}

export interface MessageResponse {
  username: string;
  message: string;
  ttl: number;
  uuid: string;
  system: boolean;
  timestamp: string;
}

export interface MessagesResponse {
  messages: MessageResponse[];
}

export interface SendRequest {
  username: string;
  message: string;
}

export interface SendResponse {
  uuid: string;
  propagatedTo: number;
  timestamp: string;
}

export interface DisconnectRequest {
  // Empty body as per MANUAL.md
}

export interface DisconnectResponse {
  message: string;
}

export interface HealthResponse {
  status: string;
  connectedClients: number;
  maxClients: number;
  uptime: number;
  peerNodes: number;
  nodeId: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  maxClients?: number;
}