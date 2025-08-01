import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateTokenOperation } from './CreateTokenOperation';
import { AirdropOperation } from './AirdropOperation';

export class TokenService implements IHederaService {
	private createTokenOperation = new CreateTokenOperation();
	private airdropOperation = new AirdropOperation();

	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'tokenOperation',
				type: 'options',
				displayOptions: {
					show: { resource: ['token'] },
				},
				options: [
					{
						name: 'Create Fungible Token',
						value: 'create',
						description: 'Create a new fungible token',
					},
					{
						name: 'Airdrop Token',
						value: 'airdrop',
						description: 'Airdrop tokens to multiple accounts',
					},
				],
				default: 'create',
			},
			{
				displayName: 'Token Name',
				name: 'tokenName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create'],
					},
				},
				default: '',
				placeholder: 'My Token',
				description: 'The name of the fungible token',
				required: true,
			},
			{
				displayName: 'Symbol',
				name: 'tokenSymbol',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create'],
					},
				},
				default: '',
				placeholder: 'MTK',
				description: 'The symbol of the fungible token (e.g., MTK)',
				required: true,
			},
			{
				displayName: 'Decimals',
				name: 'tokenDecimals',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create'],
					},
				},
				typeOptions: {
					minValue: 0,
					maxValue: 8,
				},
				default: 8,
				description: 'The number of decimal places for the token (0-8)',
				required: true,
			},
			{
				displayName: 'Initial Supply',
				name: 'initialSupply',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create'],
					},
				},
				typeOptions: {
					minValue: 0,
				},
				default: 1000000,
				description: 'The initial supply of tokens to create',
				required: true,
			},
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['airdrop'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The ID of the token to airdrop',
				required: true,
			},
			{
				displayName: 'Recipient Account ID',
				name: 'recipientAccountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['airdrop'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The account ID to receive the airdropped tokens',
				required: true,
			},
			{
				displayName: 'Amount',
				name: 'airdropAmount',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['airdrop'],
					},
				},
				typeOptions: {
					minValue: 0,
				},
				default: 100,
				description: 'The amount of tokens to airdrop',
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
			case 'create':
				params.tokenName = getNodeParameter('tokenName', itemIndex);
				params.tokenSymbol = getNodeParameter('tokenSymbol', itemIndex);
				params.tokenDecimals = getNodeParameter('tokenDecimals', itemIndex);
				params.initialSupply = getNodeParameter('initialSupply', itemIndex);
				// Add treasury account ID for token creation
				params.treasuryAccountId = accountId;
				break;
			case 'airdrop':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.recipientAccountId = getNodeParameter('recipientAccountId', itemIndex);
				params.airdropAmount = getNodeParameter('airdropAmount', itemIndex);
				// Add sender account ID for airdrop operations
				params.senderAccountId = accountId;
				break;
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}

		return params;
	}

	async execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult> {
		switch (operation) {
			case 'create':
				return this.createTokenOperation.execute(params, client);
			case 'airdrop':
				return this.airdropOperation.execute(params, client);
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}
	}
}
