# LB P2P HTTP Node - User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Running Multiple Nodes](#running-multiple-nodes)
6. [Client Integration](#client-integration)
7. [API Reference](#api-reference)
8. [Example Clients](#example-clients)
9. [Network Topology](#network-topology)
10. [Troubleshooting](#troubleshooting)
11. [Performance Tuning](#performance-tuning)

---

## Introduction

**LB P2P HTTP Node** is an HTTP-based peer-to-peer message propagation system that implements a distributed flooding algorithm with TTL (Time-To-Live) and UUID-based deduplication. It allows clients to connect via HTTP and send messages that are automatically propagated across a network of interconnected nodes.

### Key Features

- ✅ **No WebSockets Required**: Uses HTTP long polling for real-time communication
- ✅ **Flooding Protocol**: Messages propagate automatically across the network
- ✅ **Loop Prevention**: UUID deduplication and TTL limiting
- ✅ **Session Management**: Token-based authentication
- ✅ **Configurable Limits**: Max clients, TTL, timeouts
- ✅ **Health Monitoring**: Built-in health checks for peer nodes
- ✅ **Simple API**: RESTful HTTP endpoints
- ✅ **Cross-Platform**: Works on any platform with Node.js

### Use Cases

- **LAN Chat Applications**: Chat systems for local networks
- **Distributed Messaging**: Message propagation across multiple servers
- **Event Broadcasting**: Broadcast events to multiple clients across nodes
- **Gateway Integration**: Bridge between LAN P2P networks and HTTP clients

---

## Installation

### Requirements

- **Node.js**: Version 16 or higher
- **npm**: Comes with Node.js

### Install from Source

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lb-p2p-node-http.git
cd lb-p2p-node-http
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link the CLI command (optional):
```bash
npm link
```

After linking, you can run the command globally:
```bash
lb-p2p-node-http
```

Alternatively, run directly without linking:
```bash
node dist/cli.js
```

---

## Quick Start

### Start a Single Node

Start a node on the default port (8080):

```bash
lb-p2p-node-http
```

Output:
```
[2026-03-25T14:30:00.000Z] [INFO] HTTP server listening on port 8080
[2026-03-25T14:30:00.000Z] [INFO] Node ID: a7f3c2b1-4e5f-6g7h-8i9j-0k1l2m3n4o5p
[2026-03-25T14:30:00.000Z] [INFO] Max clients: 50
[2026-03-25T14:30:00.000Z] [INFO] Peer health checks started (interval: 60s)
```

### Connect a Client

Use any HTTP client (curl, Postman, browser fetch, etc.):

1. **Connect and get a session token:**
```bash
curl -X POST http://localhost:8080/connect
```

Response:
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "connectedClients": 1,
  "maxClients": 50,
  "nodeId": "a7f3c2b1-..."
}
```

2. **Send a message:**
```bash
curl -X POST http://localhost:8080/send \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"username": "Alice", "message": "Hello, world!"}'
```

3. **Receive messages (long polling):**
```bash
curl -X GET http://localhost:8080/messages \
  -H "Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000"
```

---

## Configuration

### Command-Line Options

```bash
lb-p2p-node-http [options]
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--port` | `-p` | 8080 | HTTP port to listen on |
| `--peers` | | (none) | Comma-separated list of peer node URLs |
| `--verbose` | `-v` | false | Enable verbose logging |

### Examples

**Start on custom port:**
```bash
lb-p2p-node-http --port 3000
```

**Start with peer nodes:**
```bash
lb-p2p-node-http --port 8080 --peers http://192.168.1.100:8081,http://192.168.1.101:8082
```

**Start with verbose logging:**
```bash
lb-p2p-node-http --port 8080 --verbose
```

**Full configuration:**
```bash
lb-p2p-node-http \
  --port 8080 \
  --peers http://node2:8081,http://node3:8082 \
  --verbose
```

### Environment-Based Configuration

You can also use environment variables (requires code modification):

```bash
export HTTP_PORT=8080
export MAX_CLIENTS=100
export PEER_NODES="http://node2:8081,http://node3:8082"
lb-p2p-node-http
```

---

## Running Multiple Nodes

### Local Testing (Same Machine)

Start multiple nodes on different ports:

**Terminal 1 - Node A:**
```bash
lb-p2p-node-http --port 8080 --peers http://localhost:8081,http://localhost:8082
```

**Terminal 2 - Node B:**
```bash
lb-p2p-node-http --port 8081 --peers http://localhost:8080,http://localhost:8082
```

**Terminal 3 - Node C:**
```bash
lb-p2p-node-http --port 8082 --peers http://localhost:8080,http://localhost:8081
```

Now all three nodes are connected and will propagate messages between each other.

### Network Deployment (Different Machines)

**Machine 1 (192.168.1.100):**
```bash
lb-p2p-node-http --port 8080 --peers http://192.168.1.101:8080,http://192.168.1.102:8080
```

**Machine 2 (192.168.1.101):**
```bash
lb-p2p-node-http --port 8080 --peers http://192.168.1.100:8080,http://192.168.1.102:8080
```

**Machine 3 (192.168.1.102):**
```bash
lb-p2p-node-http --port 8080 --peers http://192.168.1.100:8080,http://192.168.1.101:8080
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/cli.js", "--port", "8080"]
```

Build and run:
```bash
docker build -t lb-p2p-node-http .
docker run -p 8080:8080 lb-p2p-node-http
```

---

## Client Integration

### Workflow

1. **POST /connect** → Get session token
2. **GET /messages** → Start long polling (in background)
3. **POST /send** → Send messages
4. Loop: When GET /messages completes → immediately reconnect
5. **POST /disconnect** → Close session when done

### Client Requirements

- Must support HTTP/1.1
- Must handle long polling (requests that stay open up to 30 seconds)
- Should automatically reconnect GET /messages after each response
- Must include Authorization header with Bearer token

---

## API Reference

### POST /connect

Creates a new client session.

**Request:**
```http
POST /connect HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{}
```

**Response (200 OK):**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "connectedClients": 1,
  "maxClients": 50,
  "nodeId": "a7f3c2b1-..."
}
```

**Error (503 Service Unavailable):**
```json
{
  "error": "Service unavailable",
  "message": "Maximum number of clients reached",
  "maxClients": 50
}
```

---

### GET /messages

Long polling endpoint to receive messages.

**Request:**
```http
GET /messages HTTP/1.1
Host: localhost:8080
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK) - With Messages:**
```json
{
  "messages": [
    {
      "username": "Alice",
      "message": "Hello, world!",
      "ttl": 4,
      "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "system": false,
      "timestamp": "2026-03-25T14:30:00.000Z"
    }
  ]
}
```

**Response (204 No Content) - Timeout:**
No body. Client should immediately reconnect.

**Behavior:**
- Request is held open for up to 30 seconds
- Returns immediately if messages arrive
- Returns 204 after 30 seconds if no messages
- Client must reconnect after EVERY response

---

### POST /send

Sends a message to the network.

**Request:**
```http
POST /send HTTP/1.1
Host: localhost:8080
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "username": "Alice",
  "message": "Hello, world!"
}
```

**Response (200 OK):**
```json
{
  "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "propagatedTo": 3,
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

---

### POST /disconnect

Closes the client session.

**Request:**
```http
POST /disconnect HTTP/1.1
Host: localhost:8080
Authorization: Bearer 550e8400-e29b-41d4-a716-446655440000
```

**Response (200 OK):**
```json
{
  "message": "Disconnected successfully"
}
```

---

### GET /health

Health check endpoint.

**Request:**
```http
GET /health HTTP/1.1
Host: localhost:8080
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "connectedClients": 15,
  "maxClients": 50,
  "uptime": 3600,
  "peerNodes": 3,
  "nodeId": "a7f3c2b1-..."
}
```

---

## Example Clients

### JavaScript (Browser)

```javascript
class P2PClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
    this.polling = false;
  }

  async connect() {
    const response = await fetch(`${this.baseUrl}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    this.token = data.token;
    console.log('Connected:', data);
    
    this.startPolling();
  }

  async send(username, message) {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ username, message })
    });
    
    return await response.json();
  }

  async startPolling() {
    this.polling = true;
    
    while (this.polling) {
      try {
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (response.status === 200) {
          const data = await response.json();
          data.messages.forEach(msg => {
            console.log(`[${msg.username}]: ${msg.message}`);
            this.onMessage(msg);
          });
        }
        // Immediately reconnect regardless of response
      } catch (error) {
        console.error('Polling error:', error);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async disconnect() {
    this.polling = false;
    
    await fetch(`${this.baseUrl}/disconnect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  onMessage(message) {
    // Override this method to handle messages
    console.log('Message received:', message);
  }
}

// Usage
const client = new P2PClient('http://localhost:8080');
await client.connect();
await client.send('Alice', 'Hello, world!');
```

### Node.js

```javascript
import fetch from 'node-fetch';

class P2PClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = null;
    this.polling = false;
  }

  async connect() {
    const response = await fetch(`${this.baseUrl}/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    this.token = data.token;
    console.log('Connected:', data);
    
    this.startPolling();
  }

  async send(username, message) {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ username, message })
    });
    
    return await response.json();
  }

  async startPolling() {
    this.polling = true;
    
    while (this.polling) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000); // 35s timeout
        
        const response = await fetch(`${this.baseUrl}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (response.status === 200) {
          const data = await response.json();
          data.messages.forEach(msg => {
            this.onMessage(msg);
          });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Polling timeout, reconnecting...');
        } else {
          console.error('Polling error:', error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  async disconnect() {
    this.polling = false;
    
    await fetch(`${this.baseUrl}/disconnect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
  }

  onMessage(message) {
    console.log(`[${message.username}] [TTL:${message.ttl}]: ${message.message}`);
  }
}

// Usage
const client = new P2PClient('http://localhost:8080');
await client.connect();
await client.send('Bob', 'Hello from Node.js!');

// Keep running
await new Promise(() => {});
```

### Python

```python
import requests
import threading
import time

class P2PClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
        self.polling = False
        self.polling_thread = None
    
    def connect(self):
        response = requests.post(f"{self.base_url}/connect")
        data = response.json()
        self.token = data['token']
        print(f"Connected: {data}")
        
        self.start_polling()
    
    def send(self, username, message):
        response = requests.post(
            f"{self.base_url}/send",
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.token}'
            },
            json={'username': username, 'message': message}
        )
        return response.json()
    
    def start_polling(self):
        self.polling = True
        self.polling_thread = threading.Thread(target=self._poll_loop)
        self.polling_thread.daemon = True
        self.polling_thread.start()
    
    def _poll_loop(self):
        while self.polling:
            try:
                response = requests.get(
                    f"{self.base_url}/messages",
                    headers={'Authorization': f'Bearer {self.token}'},
                    timeout=35
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for msg in data['messages']:
                        self.on_message(msg)
            except requests.exceptions.Timeout:
                print("Polling timeout, reconnecting...")
            except Exception as e:
                print(f"Polling error: {e}")
                time.sleep(1)
    
    def disconnect(self):
        self.polling = False
        
        requests.post(
            f"{self.base_url}/disconnect",
            headers={'Authorization': f'Bearer {self.token}'}
        )
    
    def on_message(self, message):
        print(f"[{message['username']}] [TTL:{message['ttl']}]: {message['message']}")

# Usage
client = P2PClient('http://localhost:8080')
client.connect()
client.send('Charlie', 'Hello from Python!')

# Keep running
try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    client.disconnect()
```

---

## Network Topology

### Message Flow

```
Client A → Node 1 → [ Node 2, Node 3 ]
                ↓
           [ Client B, Client C ]
```

When Client A sends a message to Node 1:

1. Node 1 receives message with TTL=4
2. Node 1 broadcasts to local clients (B, C)
3. Node 1 propagates to peer nodes (2, 3) with TTL=3
4. Nodes 2 and 3 broadcast to their clients
5. Nodes 2 and 3 propagate to their peers with TTL=2
6. Process continues until TTL reaches 1

### Network Diameter

With default TTL=5, messages can traverse up to 5 hops:

```
Node A → Node B → Node C → Node D → Node E → Node F
 TTL:4    TTL:3    TTL:2    TTL:1    TTL:0   (stops)
```

### Redundancy and Deduplication

If Node A connects to multiple nodes, the message may reach Node F via multiple paths:

```
Path 1: A → B → F
Path 2: A → C → F
```

Node F receives the message twice but only processes it once (UUID deduplication).

---

## Troubleshooting

### Issue: "Maximum number of clients reached"

**Cause**: Node has reached the MAX_CLIENTS limit (default: 50).

**Solutions:**
1. Modify `src/config.ts` to increase MAX_CLIENTS
2. Start a new node on a different port
3. Wait for inactive sessions to timeout (5 minutes)

---

### Issue: Messages not propagating to peer nodes

**Checks:**
1. Verify peer nodes are running:
   ```bash
   curl http://peer-node-url/health
   ```

2. Check node logs for connection errors

3. Verify peer URLs are correct (include http://)

4. Check firewall settings

---

### Issue: Long polling timeouts frequently

**Cause**: Network latency or server overload.

**Solutions:**
1. Increase LONG_POLL_TIMEOUT in `src/config.ts`
2. Reduce number of clients per node
3. Check server resources (CPU, memory)

---

### Issue: Duplicate messages

**Cause**: Should not happen due to UUID deduplication.

**If it occurs:**
1. Check that nodes have unique Node IDs (automatic)
2. Verify message UUID is being generated correctly
3. Check if message cache is being cleared prematurely

---

## Performance Tuning

### Scalability

**Max Clients per Node:**
- Default: 50 clients
- Recommended: 50-100 clients per node
- High-end servers: Up to 200 clients

**Max Peer Nodes:**
- Recommended: 3-10 peer nodes per node
- Flooding creates O(n²) traffic with many peers

### Memory Usage

**Message Cache:**
- Default: 1000 UUIDs cached
- Each UUID: ~36 bytes
- Total: ~36KB per node

**Session Storage:**
- Each session: ~1KB (including pending messages)
- 50 clients: ~50KB

**Total Memory (typical):**
- Base: ~20MB (Node.js + Express)
- Per client: ~1KB
- Total for 50 clients: ~20MB + 50KB = ~20.05MB

### Network Bandwidth

**Per Message:**
- Average message: ~200 bytes JSON
- With headers: ~400 bytes

**Flooding Overhead:**
- Message reaches all nodes in network
- With 10 nodes: 10x bandwidth
- Optimize by reducing TTL if needed

### CPU Usage

**Long Polling:**
- Minimal CPU when idle
- Spike when messages broadcast

**Recommendations:**
- Use Node.js cluster mode for multi-core
- Deploy multiple nodes instead of scaling one node
- Use load balancer for client connections

---

## Advanced Configuration

### Modifying Defaults

Edit `src/config.ts`:

```typescript
const config: Config = {
  HTTP_PORT: 8080,
  MAX_CLIENTS: 100,              // Increase max clients
  LONG_POLL_TIMEOUT: 60000,      // Increase timeout to 60s
  MESSAGE_TTL: 3,                // Reduce TTL to limit propagation
  SESSION_TIMEOUT: 600000,       // Increase session timeout to 10 minutes
  PEER_NODES: [],
  NODE_ID: uuidv4(),
};
```

After changes, rebuild:
```bash
npm run build
```

### Production Deployment

**Use a Process Manager:**
```bash
npm install -g pm2
pm2 start dist/cli.js --name p2p-node -- --port 8080 --peers http://node2:8080
```

**Enable HTTPS:**
Add reverse proxy (nginx, Caddy) for TLS:

```nginx
server {
    listen 443 ssl;
    server_name node.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;  # Match LONG_POLL_TIMEOUT
    }
}
```

---

## License

GPL-3.0-only

---

## Support

For issues, questions, or contributions:
- GitHub: https://github.com/yourusername/lb-p2p-node-http
- Report bugs: https://github.com/yourusername/lb-p2p-node-http/issues

---

**Happy messaging! 🚀**
