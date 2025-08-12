import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateFungibleTokenOperation } from './CreateFungibleTokenOperation';
import { AirdropOperation } from './AirdropOperation';
import { CreateNonFungibleTokenOperation } from './CreateNonFungibleTokenOperation';
import { NonFungibleTokenMintOperation } from './NonFungibleTokenMintOperation';

export class TokenService implements IHederaService {
	private createFungibleTokenOperation = new CreateFungibleTokenOperation();
	private airdropOperation = new AirdropOperation();
	private CreateNonFungibleTokenOperation = new CreateNonFungibleTokenOperation();
	private NonFungibleTokenMintOperation = new NonFungibleTokenMintOperation();

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
						name: 'Mint Fungible Token',
						value: 'mint',
						description: 'Mint additional supply for a fungible token',
					},
					{
						name: 'Airdrop Token',
						value: 'airdrop',
						description: 'Airdrop tokens to multiple accounts',
					},
				],
				default: 'create',
			},
			// Mint-specific inputs
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mint'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The ID of the fungible token to mint',
				required: true,
			},
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mint'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 100,
				description:
					"Whole token amount to mint. The node will automatically convert this to the token's smallest units based on its decimals.",
				required: true,
			},
			{
				displayName: 'Token Name',
				name: 'tokenName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create', 'createNft'],
					},
				},
				default: '',
				placeholder: 'My Token',
				description: 'The name of the token',
				required: true,
			},
			{
				displayName: 'Symbol',
				name: 'tokenSymbol',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create', 'createNft'],
					},
				},
				default: '',
				placeholder: 'MTK',
				description: 'The symbol of the token (e.g., MTK)',
				required: true,
			},
			// FT only
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
				displayName: 'Enable Supply Key',
				name: 'enableSupplyKey',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['create'],
					},
				},
				default: false,
				description:
					'Whether to enable a supply key on the token to allow future mint/burn. If disabled, supply is fixed forever.',
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
				params.enableSupplyKey = getNodeParameter('enableSupplyKey', itemIndex);
				break;
			case 'mint':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.amount = getNodeParameter('amount', itemIndex);
				break;
			case 'airdrop':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.recipientAccountId = getNodeParameter('recipientAccountId', itemIndex);
				params.airdropAmount = getNodeParameter('airdropAmount', itemIndex);
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
				return this.createFungibleTokenOperation.execute(params, client);
			case 'createNft':
				return this.CreateNonFungibleTokenOperation.execute(params, client);
			case 'mintNft':
				return this.NonFungibleTokenMintOperation.execute(params, client);
			case 'airdrop':
				return this.airdropOperation.execute(params, client);
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}
	}
}
