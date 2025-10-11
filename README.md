# n8n-nodes-hedera

This community node lets you build n8n workflows that create and manage Hedera accounts, tokens, consensus topics, and mirror-node queries without writing code. It uses the official `@hashgraph/sdk` for transactions and the public mirror-node REST API for read-only queries.

## Installation

1. Set up a [self-hosted n8n instance](https://docs.n8n.io/hosting/installation/npm/).
2. Install the package `n8n-nodes-hedera` inside your n8n instance following the [community node guide](https://docs.n8n.io/integrations/community-nodes/installation/gui-install/).
3. Add the **Hedera** node to any workflow from the nodes panel.

## Credentials

Create a **Hedera API Account API** credential in n8n with:

- `Account ID` – your Hedera account (format `0.0.x`)
- `Private Key` – account private key; stored securely by n8n
- `Private Key Type` – choose `ECDSA (secp256k1)` or `ED25519` to match your key
- `Network` – Mainnet, Testnet, or Previewnet

The node validates credentials and automatically initialises an SDK client with the correct ledger configuration.

## Supported Resources & Operations

### Account

- **Create Account** – spin up a new Hedera account, generate a fresh ECDSA key pair, set optional initial HBAR, and return the receipt plus the new keys

### Token Management

- **Create Fungible Token** – create new fungible tokens with optional supply key and treasury taken from the authenticated account
- **Create NFT** – launch non-fungible tokens (finite or infinite supply) with supply key management
- **Mint Fungible Token** – fetch token decimals via the mirror node, convert human-readable amounts, and mint additional supply
- **Mint NFT** – mint NFT serials by attaching metadata URIs
- **Transfer Fungible Token** – perform token airdrops/transfer between accounts, handling decimal conversions automatically
- **Transfer HBAR** – move HBAR between accounts using the authenticated account as sender
- **Transfer NFT** – move an NFT serial between accounts via Hedera’s token airdrop transaction

### Consensus Service (HCS)

- **Create Topic** – create public or submit-key-protected topics with optional memo metadata
- **Submit Message** – publish messages (up to 1024 bytes) to any topic and return sequence and consensus timestamps

### Mirror Queries

- **Get Account Info** – fetch on-chain account metadata
- **Get Account HBAR Balance** – return current HBAR balance in HBAR units
- **Get Account Tokens** – list all fungible token balances associated with an account
- **Get Account NFTs** – list NFTs held by an account
- **Get Token Info** – retrieve token metadata, treasury, keys, and supply details
- **Get Token Balance** – inspect the latest balance for a token, optionally filtered by account
- **Get Topic Messages** – read paginated consensus-topic messages, decoding base64 payloads to UTF-8

## Architecture Overview

The node is organised as a service-layer system:

- **`nodes/Hedera/Hedera.node.ts`** – main n8n node that handles credentials, spins up the SDK client, and delegates to services
- **`OperationFactory`** – central router that returns the correct service for each resource and aggregates their dynamic properties
- **Services (`nodes/Hedera/services/*`)** – implement the shared `IHederaService` contract to define UI properties, extract parameters from n8n, and execute resource-specific operations
- **Operations** – small classes under each service directory that focus on a single Hedera SDK or mirror-node interaction
- **Mirror utilities** – lightweight REST client (via `openapi-fetch`) that respects the network selected in your credentials

Adding a new Hedera capability usually means creating a new operation class, registering it in the service, and exposing properties within that service. The modular structure keeps each operation self-contained and easy to extend.

## Using the Node in n8n

1. Drop the **Hedera** node into a workflow.
2. Select the resource (`Account`, `Token`, `Consensus Service (HCS)`, or `Mirror Query`).
3. Choose an operation; the node displays only the parameters relevant to that action.
4. Provide or map input data (e.g., token IDs, account IDs, metadata).
5. Execute the workflow to perform the transaction or read from the mirror node. Outputs always include the Hedera receipt or mirror-node payload so you can chain additional workflow logic.

## Development & Testing

```bash
npm install          # install dependencies
npm run dev          # TypeScript watch build
npm run build        # compile to dist/ and bundle node icons
npm run lint         # lint sources
npm run format       # apply Prettier formatting
```

- Generate up-to-date mirror-node OpenAPI typings with `npm run generate:hedera-types`.
- Node.js 20.15 or later is required (see `package.json` engines field).

## Resources

- [Hedera documentation](https://docs.hedera.com/)
- [Hedera portal (account onboarding)](https://portal.hedera.com/)
- [Hedera SDK for JavaScript](https://docs.hedera.com/hedera/sdks-and-apis)
- [n8n community node docs](https://docs.n8n.io/integrations/#community-nodes)

## License

MIT © Plaza Tech Ltd
