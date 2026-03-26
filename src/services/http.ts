import { addChat } from "../contexts/ChatContext.js";
import { log } from "../contexts/LogsContext.js";
import { USERNAME } from "../config.js";
import {
  ConnectResponse,
  MessagesResponse,
  SendResponse,
} from "../types/http.js";

type HTTPProtocolType = "http" | "https";

interface HTTPClientConfig {
  protocol: HTTPProtocolType;
  host: string;
  port: number;
}

export default class HTTPServer {
  private static instance: HTTPServer | null = null;
  private token: string | null = null;
  private config: HTTPClientConfig | null = null;
  private isConnected: boolean = false;
  private isPolling: boolean = false;
  private baseUrl: string = "";
  private processedUUIDs: Set<string> = new Set();

  private constructor() {}

  static getInstance(): HTTPServer {
    if (!HTTPServer.instance) {
      HTTPServer.instance = new HTTPServer();
    }
    return HTTPServer.instance;
  }

  /**
   * Parse and validate the remote URL
   * Supports formats like:
   * - localhost:8080
   * - 192.168.1.100:8080
   * - example.com:8080
   */
  private parseUrl(url: string): HTTPClientConfig {
    // Default to http if no protocol specified
    let protocol: HTTPProtocolType = "http";
    let cleanUrl = url;

    if (url.startsWith("http://")) {
      protocol = "http";
      cleanUrl = url.slice(7);
    } else if (url.startsWith("https://")) {
      protocol = "https";
      cleanUrl = url.slice(8);
    }

    // Parse host and port
    const parts = cleanUrl.split(":");
    const host = parts[0];
    const port = parseInt(parts[1] || "8080", 10);

    if (!host) {
      throw new Error("Invalid URL: missing host");
    }

    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error(
        "Invalid port number. Must be between 1 and 65535"
      );
    }

    return { protocol, host, port };
  }

  async connect(protocol: string, url: string): Promise<void> {
    // Validate protocol
    if (protocol.toLowerCase() !== "http") {
      throw new Error(
        `Unsupported protocol: ${protocol}. Only 'http' is supported.`
      );
    }

    // Check if already connected
    if (this.isConnected) {
      throw new Error(
        "Already connected to a remote HTTP node. Disconnect first."
      );
    }

    try {
      this.config = this.parseUrl(url);
      this.baseUrl = `${this.config.protocol}://${this.config.host}:${this.config.port}`;

      log(`⚙ Connecting to remote HTTP node at ${this.baseUrl}...`);

      // Connect to the remote server
      const connectResponse = await this.fetchAPI<ConnectResponse>(
        "/connect",
        "POST",
        {}
      );

      this.token = connectResponse.token;
      this.isConnected = true;
      this.isPolling = false;
      this.processedUUIDs.clear();

      log(
        `✔ Connected to HTTP node ${connectResponse.nodeId} (${connectResponse.connectedClients}/${connectResponse.maxClients} clients)`
      );

      // Add system message
      addChat({
        username: "System",
        message: `✅ Connected to remote HTTP node at ${this.baseUrl}`,
        uuid: `sys-${Date.now()}`,
        ttl: 0,
        system: true,
      });

      // Start polling for messages
      this.startPolling();
    } catch (error) {
      this.isConnected = false;
      this.token = null;
      this.config = null;

      const errorMsg =
        error instanceof Error ? error.message : String(error);
      log(`❌ Connection failed: ${errorMsg}`);

      addChat({
        username: "System",
        message: `❌ Failed to connect to HTTP node: ${errorMsg}`,
        uuid: `sys-${Date.now()}`,
        ttl: 0,
        system: true,
      });

      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.token) {
      throw new Error("Not connected to any remote HTTP node");
    }

    try {
      this.isPolling = false;

      // Send disconnect request
      await this.fetchAPI("/disconnect", "POST", {});

      log(`✔ Disconnected from HTTP node`);

      addChat({
        username: "System",
        message: `👋 Disconnected from remote HTTP node`,
        uuid: `sys-${Date.now()}`,
        ttl: 0,
        system: true,
      });

      this.token = null;
      this.isConnected = false;
      this.config = null;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      log(`❌ Disconnect failed: ${errorMsg}`);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<void> {
    if (!this.isConnected || !this.token) {
      throw new Error("Not connected to any remote HTTP node");
    }

    try {
      const response = await this.fetchAPI<SendResponse>("/send", "POST", {
        username: USERNAME(),
        message: message,
      });

      log(
        `✔ Message sent to HTTP node (propagated to ${response.propagatedTo} peer(s))`
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : String(error);
      log(`❌ Send message failed: ${errorMsg}`);
      throw error;
    }
  }

  private async startPolling(): Promise<void> {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    log(`⚙ Starting message polling...`);

    while (this.isPolling && this.isConnected) {
      try {
        const response = await this.fetchAPI<MessagesResponse>(
          "/messages",
          "GET"
        );

        // Process received messages
        for (const msg of response.messages) {
          // Skip if we've already processed this message
          if (this.processedUUIDs.has(msg.uuid)) {
            continue;
          }

          this.processedUUIDs.add(msg.uuid);

          // Add message to chat
          addChat({
            username: msg.username,
            message: msg.message,
            uuid: msg.uuid,
            ttl: msg.ttl,
            system: msg.system || false,
          });
        }
      } catch (error) {
        if (this.isPolling && this.isConnected) {
          // Only log if we're still supposed to be polling
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          log(`⚠ Polling error: ${errorMsg}`);

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    log(`⚙ Message polling stopped`);
  }

  private async fetchAPI<T = any>(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    body?: unknown
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("Not connected");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Add authorization header if we have a token
    if (this.token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    // Add body for POST requests
    if (method === "POST" && body) {
      options.body = JSON.stringify(body);
    }

    // Set timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000); // 35 seconds

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as any).message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Handle 204 No Content (polling timeout)
      if (response.status === 204) {
        return { messages: [] } as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof TypeError) {
        throw new Error(
          `Network error: ${error.message}. Is the server running at ${this.baseUrl}?`
        );
      }

      throw error;
    }
  }

  isRemoteConnected(): boolean {
    return this.isConnected;
  }

  getRemoteInfo(): { baseUrl: string; token: string | null } | null {
    if (!this.isConnected) {
      return null;
    }

    return {
      baseUrl: this.baseUrl,
      token: this.token,
    };
  }
}
