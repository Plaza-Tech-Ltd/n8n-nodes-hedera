import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { AirdropOperation } from './AirdropOperation';
import { CreateFungibleTokenOperation } from './CreateFungibleTokenOperation';
import { CreateNonFungibleTokenOperation } from './CreateNonFungibleTokenOperation';
import { NonFungibleTokenMintOperation } from './NonFungibleTokenMintOperation';
import { FungibleTokenMintOperation } from './FungibleTokenMintOperation';

export class TokenService implements IHederaService {
	private airdropOperation = new AirdropOperation();
	private createFungibleTokenOperation = new CreateFungibleTokenOperation();
	private fungibleTokenMintOperation = new FungibleTokenMintOperation();
	private createNonFungibleTokenOperation = new CreateNonFungibleTokenOperation();
	private nonFungibleTokenMintOperation = new NonFungibleTokenMintOperation();

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
						name: 'Airdrop Token',
						value: 'airdrop',
						description: 'Airdrop tokens to multiple accounts',
					},
					{
						name: 'Create Fungible Token',
						value: 'createFT',
						description: 'Create a new fungible token',
					},
					{
						name: 'Create Non Fungible Token',
						value: 'createNFT',
						description: 'Create a new non-fungible token (NFT)',
					},
					{
						name: 'Mint Fungible Token',
						value: 'mintFT',
						description: 'Mint additional supply for a fungible token',
					},
					{
						name: 'Mint Non Fungible Token',
						value: 'mintNFT',
						description: 'Mint non-fungible token (NFT)',
					},
				],
				default: 'createFT',
			},
			// Token creation properties
			{
				displayName: 'Token Name',
				name: 'tokenName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createFT', 'createNFT'],
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
						tokenOperation: ['createFT', 'createNFT'],
					},
				},
				default: '',
				placeholder: 'MTK',
				description: 'The symbol of the token (e.g., MTK)',
				required: true,
			},
			// FT only properties
			{
				displayName: 'Decimals',
				name: 'tokenDecimals',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createFT'],
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
						tokenOperation: ['createFT'],
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
						tokenOperation: ['createFT'],
					},
				},
				default: false,
				description:
					'Whether to enable a supply key on the token to allow future mint/burn. If disabled, supply is fixed forever.',
			},
			// NFT properties
			{
				displayName: 'Supply Type',
				name: 'supplyType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createNFT'],
					},
				},
				options: [
					{ name: 'Finite', value: 'FINITE', description: 'Fixed maximum supply' },
					{ name: 'Infinite', value: 'INFINITE', description: 'Unlimited supply' },
				],
				default: 'INFINITE',
				description: 'Whether the NFT supply is finite or infinite',
				required: true,
			},
			{
				displayName: 'Max Supply',
				name: 'maxSupply',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createNFT'],
						supplyType: ['FINITE'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description:
					'The maximum supply of NFTs (e.g., 1 for a single NFT, or higher for a collection)',
				required: true,
			},
			// Simplified NFT Mint properties - Just Token ID and Metadata URI
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNFT', 'mintFT', 'airdrop'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The ID of the token',
				required: true,
			},
			{
				displayName: 'Metadata URI',
				name: 'metadataUri',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNFT'],
					},
				},
				default: '',
				placeholder: 'ipfs://QmHash... or https://myserver.com/metadata.json',
				description: 'URI pointing to your HIP-412 compliant metadata JSON file',
				required: true,
			},
			// Mint FT properties
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintFT'],
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
			// Airdrop properties
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
			case 'createFT':
				params.tokenName = getNodeParameter('tokenName', itemIndex);
				params.tokenSymbol = getNodeParameter('tokenSymbol', itemIndex);
				params.tokenDecimals = getNodeParameter('tokenDecimals', itemIndex);
				params.initialSupply = getNodeParameter('initialSupply', itemIndex);
				params.treasuryAccountId = accountId;
				params.enableSupplyKey = getNodeParameter('enableSupplyKey', itemIndex);
				break;
			case 'createNFT':
				params.tokenName = getNodeParameter('tokenName', itemIndex);
				params.tokenSymbol = getNodeParameter('tokenSymbol', itemIndex);
				params.supplyType = getNodeParameter('supplyType', itemIndex);
				params.treasuryAccountId = accountId;
				if (params.supplyType === 'FINITE') {
					params.maxSupply = getNodeParameter('maxSupply', itemIndex);
				}
				break;
			case 'mintNFT':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.metadataUri = getNodeParameter('metadataUri', itemIndex);
				break;
			case 'mintFT':
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
			case 'createFT':
				return this.createFungibleTokenOperation.execute(params, client);
			case 'createNFT':
				return this.createNonFungibleTokenOperation.execute(params, client);
			case 'mintFT':
				return this.fungibleTokenMintOperation.execute(params, client);
			case 'mintNFT':
				return this.nonFungibleTokenMintOperation.execute(params, client);
			case 'airdrop':
				return this.airdropOperation.execute(params, client);
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}
	}
}
