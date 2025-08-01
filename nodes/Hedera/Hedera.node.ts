import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeConnectionType,
	NodeApiError,
	NodeOperationError,
	JsonObject,
} from 'n8n-workflow';

import { HederaClientFactory } from './core/HederaClient';
import { IHederaCredentials } from './core/types';
import { OperationFactory } from './operations/OperationFactory';

export class Hedera implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Hedera',
		name: 'hedera',
		icon: 'file:hedera.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with the Hedera Hashgraph network',
		subtitle:
			'={{ $parameter["resource"] + ": " + $parameter[$parameter["resource"] + "Operation"] }}',
		defaults: { name: 'Hedera' },
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'hederaApi',
				required: true,
			},
		],
		properties: [
			// Base resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				noDataExpression: true,
				type: 'options',
				options: [
					{ name: 'Account', value: 'account' },
					{ name: 'Token', value: 'token' },
					{ name: 'Mirror Query', value: 'mirror' },
				],
				default: 'account',
				description: 'Resource type to operate on',
			},
			// Service-specific properties
			...OperationFactory.getAllProperties(),
		],
	};

	/* -------------------------------------------------------------------------- */
	/*                                   logic                                    */
	/* -------------------------------------------------------------------------- */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// ---- credentials -------------------------------------------------------
		const creds = (await this.getCredentials('hederaApi')) as IHederaCredentials;
		HederaClientFactory.validateCredentials(creds);

		const { accountId } = creds;
		const client = HederaClientFactory.createClient(creds);

		// ---- loop over items ---------------------------------------------------
		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				let result: IDataObject = {};

				// Handle modular operations using services
				if (resource === 'account' || resource === 'token' || resource === 'mirror') {
					const service = OperationFactory.getService(resource);
					// Map resource names to their corresponding operation parameter names
					const operation = this.getNodeParameter(`${resource}Operation`, i) as string;

					// Extract operation-specific parameters using service with accountId
					const params = service.extractParameters(
						operation,
						this.getNodeParameter.bind(this),
						i,
						accountId,
					);

					result = await service.execute(operation, params, client);
				} else {
					throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`);
				}

				returnData.push({ json: result });
			} catch (err) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (err as Error).message } });
					continue;
				}
				throw new NodeApiError(this.getNode(), err as JsonObject);
			}
		}

		return this.prepareOutputData(returnData);
	}
}
