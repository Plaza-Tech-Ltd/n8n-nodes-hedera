import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { AccountInfoQueryOperation } from './AccountInfoQuery';
import { TokenInfoQueryOperation } from './TokenInfoQuery';

export class MirrorService implements IHederaService {
	private accountInfoQuery = new AccountInfoQueryOperation();
	private tokenInfoQuery = new TokenInfoQueryOperation();

	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'mirrorOperation',
				type: 'options',
				displayOptions: {
					show: { resource: ['mirror'] },
				},
				options: [
					{ name: 'Get Account Info', value: 'accountInfo', description: 'Get account information from mirror node' },
					{ name: 'Get Token Info', value: 'tokenInfo', description: 'Get token information from mirror node' },
				],
				default: 'accountInfo',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['accountInfo'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera account ID to query',
				required: true,
			},
			{
				displayName: 'Token ID',
				name: 'mirrorTokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['tokenInfo'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera token ID to query',
				required: true,
			},
		];
	}

	extractParameters(operation: string, getNodeParameter: Function, itemIndex: number, accountId?: string): IDataObject {
		const params: IDataObject = {};
		
		// Mirror queries don't need the accountId parameter since they're read-only
		switch (operation) {
			case 'accountInfo':
				params.accountId = getNodeParameter('accountId', itemIndex);
				break;
			case 'tokenInfo':
				// Note: mirrorTokenId maps to tokenId in the service
				params.tokenId = getNodeParameter('mirrorTokenId', itemIndex);
				break;
			default:
				throw new Error(`Unsupported mirror operation: ${operation}`);
		}
		
		return params;
	}

	async execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult> {
		switch (operation) {
			case 'accountInfo':
				return this.accountInfoQuery.execute(params, client);
			case 'tokenInfo':
				return this.tokenInfoQuery.execute(params, client);
			default:
				throw new Error(`Unsupported mirror operation: ${operation}`);
		}
	}
}