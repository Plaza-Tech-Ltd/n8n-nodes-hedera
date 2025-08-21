# AI Contributions Guide: Hedera n8n Node

This document provides comprehensive instructions for AI agents contributing to the n8n-nodes-hedera community package. It contains context about the current architecture and step-by-step instructions for adding new services and operations.

## Architecture Overview

The Hedera n8n node uses a **Service-Layer Architecture** that was refactored from a monolithic 578-line file into a modular, maintainable structure. This architecture provides:

- **Separation of concerns**: Each service handles a specific Hedera resource type
- **Encapsulated parameter handling**: Services manage 100% of their parameter extraction
- **Modular properties**: Each service defines its own n8n properties
- **Extensibility**: Easy to add new services and operations

### Key Components

1. **Main Node** (`nodes/Hedera/Hedera.node.ts`): Orchestrates execution, manages credentials
2. **Services** (`nodes/Hedera/services/*/`): Handle specific resource operations
3. **OperationFactory** (`nodes/Hedera/operations/OperationFactory.ts`): Routes requests to services
4. **Core Types** (`nodes/Hedera/core/types.ts`): Defines interfaces and contracts

## Current Service Structure

```
nodes/Hedera/
├── services/
│   ├── account/
│   │   ├── AccountService.ts (implements IHederaService)
│   │   ├── CreateAccountOperation.ts
│   │   └── TransferOperation.ts
│   ├── token/
│   │   ├── TokenService.ts (implements IHederaService)
│   │   ├── CreateTokenOperation.ts
│   │   └── AirdropOperation.ts
│   └── mirror/
│       ├── MirrorService.ts (implements IHederaService)
│       ├── AccountInfoQuery.ts
│       └── TokenInfoQuery.ts
```

## IHederaService Interface Contract

Every service MUST implement the `IHederaService` interface:

```typescript
export interface IHederaService {
	getProperties(): INodeProperties[];
	extractParameters(
		operation: string,
		getNodeParameter: Function,
		itemIndex: number,
		accountId?: string,
	): IDataObject;
	execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult>;
}
```

### Method Responsibilities

- **`getProperties()`**: Returns n8n property definitions specific to this service
- **`extractParameters()`**: Extracts and validates ALL parameters for operations (including common ones like accountId)
- **`execute()`**: Routes operation execution to specific operation classes

## Step-by-Step Guide: Adding New Services/Operations

### Step 1: Add Resource to Main Node

Update `nodes/Hedera/Hedera.node.ts` properties array to include your new resource:

```typescript
options: [
    { name: 'Account', value: 'account' },
    { name: 'Token', value: 'token' },
    { name: 'Mirror Query', value: 'mirror' },
    { name: 'Your New Resource', value: 'yourresource' }, // Add this
],
```

Also update the resource validation in the execute method:

```typescript
if (resource === 'account' || resource === 'token' || resource === 'mirror' || resource === 'yourresource') {
```

### Step 2: Create Service Directory Structure

Create the service directory and files:

```
nodes/Hedera/services/yourresource/
├── YourResourceService.ts
├── YourFirstOperation.ts
├── YourSecondOperation.ts
└── ... (additional operations)
```

### Step 3: Implement Service Class

Create `YourResourceService.ts` implementing `IHederaService`:

```typescript
import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { YourFirstOperation } from './YourFirstOperation';

export class YourResourceService implements IHederaService {
	private yourFirstOperation = new YourFirstOperation();

	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'yourresourceOperation',
				type: 'options',
				displayOptions: {
					show: { resource: ['yourresource'] },
				},
				options: [
					{
						name: 'Your First Action',
						value: 'firstaction',
						description: 'Description of first action',
					},
					// Add more operations here
				],
				default: 'firstaction',
			},
			// Define operation-specific parameters here
			{
				displayName: 'Parameter Name',
				name: 'parameterName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['yourresource'],
						yourresourceOperation: ['firstaction'],
					},
				},
				default: '',
				description: 'Description of this parameter',
				required: true,
			},
		];
	}

	extractParameters(
		operation: string,
		getNodeParameter: Function,
		itemIndex: number,
		accountId?: string,
	): IDataObject {
		const params: IDataObject = {};

		switch (operation) {
			case 'firstaction':
				params.parameterName = getNodeParameter('parameterName', itemIndex);
				// Add accountId if needed for this operation
				if (accountId) {
					params.senderAccountId = accountId; // or treasuryAccountId, etc.
				}
				break;
			default:
				throw new Error(`Unsupported yourresource operation: ${operation}`);
		}

		return params;
	}

	async execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult> {
		switch (operation) {
			case 'firstaction':
				return this.yourFirstOperation.execute(params, client);
			default:
				throw new Error(`Unsupported yourresource operation: ${operation}`);
		}
	}
}
```

### Step 4: Create Operation Classes

Create individual operation classes (e.g., `YourFirstOperation.ts`):

```typescript
import { Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class YourFirstOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		try {
			// Implement your Hedera SDK operation here
			const result = await someHederaOperation(params, client);

			return {
				success: true,
				data: result,
			};
		} catch (error) {
			return {
				success: false,
				error: (error as Error).message,
			};
		}
	}
}
```

### Step 5: Register Service in OperationFactory

Update `nodes/Hedera/operations/OperationFactory.ts`:

```typescript
import { YourResourceService } from '../services/yourresource/YourResourceService';

export class OperationFactory {
	private static yourResourceService = new YourResourceService(); // Add this

	static getService(resource: string): IHederaService {
		switch (resource) {
			case 'account':
				return this.accountService;
			case 'token':
				return this.tokenService;
			case 'mirror':
				return this.mirrorService;
			case 'yourresource': // Add this case
				return this.yourResourceService;
			default:
				throw new Error(`Unsupported resource: ${resource}`);
		}
	}

	static getAllProperties(): INodeProperties[] {
		return [
			...this.accountService.getProperties(),
			...this.tokenService.getProperties(),
			...this.mirrorService.getProperties(),
			...this.yourResourceService.getProperties(), // Add this
		];
	}
}
```

## Design Principles & Best Practices

### Keep It Simple

- **Target non-technical users**: n8n users are often results-driven, not technically deep
- **Minimal required parameters**: Only expose essential parameters needed for operations to work
- **Clear descriptions**: Use plain language in parameter descriptions
- **Sensible defaults**: Provide reasonable default values where possible

### Parameter Handling

- **Full encapsulation**: Services handle 100% of parameter extraction, including common parameters
- **Use accountId parameter**: Pass the authenticated account ID to operations that need it
- **Validate inputs**: Check required parameters and throw meaningful errors

### Property Definitions

- **Resource-specific naming**: Use `{resource}Operation` for operation parameter names
- **Display conditions**: Use `displayOptions.show` to conditionally show parameters
- **Type safety**: Specify appropriate types (`string`, `number`, `boolean`, etc.)
- **Required fields**: Mark essential parameters as `required: true`

### Error Handling

- **Meaningful messages**: Provide clear error descriptions
- **Graceful failures**: Return structured error objects from operations
- **Operation validation**: Validate operation names in both parameter extraction and execution

## Current Resources Available

1. **Account Service**: Create accounts, transfer HBAR
2. **Token Service**: Create fungible tokens, airdrop tokens
3. **Mirror Service**: Query account info, query token info (read-only operations)

## Testing Your Implementation

After implementing your service:

1. **Build**: Run `npm run build` to compile TypeScript
2. **Lint**: Run `npm run lint` to check code quality
3. **Test in n8n**: Load the built node in n8n and test operations
4. **Verify parameters**: Ensure all parameters display correctly based on resource/operation selection

## Common Patterns

### Read-only vs Transaction Operations

- **Read-only operations** (Mirror queries): Don't need accountId parameter
- **Transaction operations**: Usually need accountId for sender/treasury roles

### Parameter Mapping

- Use descriptive parameter names that match n8n conventions
- Map internal Hedera SDK parameter names appropriately
- Consider parameter naming conflicts across services

### Service Organization

- Group related operations in the same service
- Keep services focused on a single Hedera resource type
- Create separate operation classes for complex logic

## Integration Notes

- The main node automatically handles credential management and client creation
- Services receive a configured Hedera client ready for use
- The OperationFactory pattern ensures clean service registration
- Properties are automatically aggregated and displayed in the n8n UI

This modular architecture makes it straightforward to extend the node with new Hedera functionality while maintaining code quality and user experience.
