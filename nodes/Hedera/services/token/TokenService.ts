import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { AirdropOperation } from './AirdropOperation';
import { CreateFungibleTokenOperation } from './CreateFungibleTokenOperation';
import { CreateNFTOperation } from './CreateNFTOperation';
import { MintNFTOperation } from './MintNFTOperation';
import { MintFungibleTokenOperation } from './MintFungibleTokenOperation';
import { TransferNFTOperation } from './TransferNFTOperation';

export class TokenService implements IHederaService {
	private airdropOperation = new AirdropOperation();
	private createFungibleTokenOperation = new CreateFungibleTokenOperation();
	private mintFungibleTokenOperation = new MintFungibleTokenOperation();
	private createNFTOperation = new CreateNFTOperation();
	private mintNFTOperation = new MintNFTOperation();
	private transferNFTOperation = new TransferNFTOperation();

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
						value: 'createFungibleToken',
						description: 'Create a new fungible token',
					},
					{
						name: 'Create NFT',
						value: 'createNFT',
						description: 'Create a new non-fungible token (NFT)',
					},
					{
						name: 'Mint Fungible Token',
						value: 'mintFungibleToken',
						description: 'Mint additional supply for a fungible token',
					},
					{
						name: 'Mint NFT',
						value: 'mintNFT',
						description: 'Mint non-fungible token (NFT)',
					},
					{
						name: 'Transfer NFT',
						value: 'transferNFT',
						description: 'Transfer an NFT from one account to another',
					},
				],
				default: 'createFungibleToken',
			},
			// Token creation properties
			{
				displayName: 'Token Name',
				name: 'tokenName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createFungibleToken', 'createNFT'],
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
						tokenOperation: ['createFungibleToken', 'createNFT'],
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
						tokenOperation: ['createFungibleToken'],
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
						tokenOperation: ['createFungibleToken'],
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
						tokenOperation: ['createFungibleToken'],
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
			{
				displayName: 'Token ID',
				name: 'tokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNFT', 'mintFungibleToken', 'airdrop', 'transferNFT'],
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
				description: 'URI pointing to the metadata JSON file',
				required: true,
			},
			// Mint Fungible Token properties
			{
				displayName: 'Amount',
				name: 'amount',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintFungibleToken'],
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
			// Transfer NFT properties
			{
				displayName: 'Serial Number',
				name: 'serialNumber',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['transferNFT'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'The serial number of the NFT to transfer',
				required: true,
			},
			{
				displayName: 'From Account ID',
				name: 'fromAccountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['transferNFT'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The account ID that currently owns the NFT',
				required: true,
			},
			{
				displayName: 'To Account ID',
				name: 'toAccountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['transferNFT'],
					},
				},
				default: '',
				placeholder: '0.0.67890',
				description: 'The account ID that will receive the NFT',
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
			case 'createFungibleToken':
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
			case 'mintFungibleToken':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.amount = getNodeParameter('amount', itemIndex);
				break;
			case 'transferNFT':
				params.tokenId = getNodeParameter('tokenId', itemIndex);
				params.serialNumber = getNodeParameter('serialNumber', itemIndex);
				params.fromAccountId = getNodeParameter('fromAccountId', itemIndex);
				params.toAccountId = getNodeParameter('toAccountId', itemIndex);
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
			case 'createFungibleToken':
				return this.createFungibleTokenOperation.execute(params, client);
			case 'createNFT':
				return this.createNFTOperation.execute(params, client);
			case 'mintFungibleToken':
				return this.mintFungibleTokenOperation.execute(params, client);
			case 'mintNFT':
				return this.mintNFTOperation.execute(params, client);
			case 'transferNFT':
				return this.transferNFTOperation.execute(params, client);
			case 'airdrop':
				return this.airdropOperation.execute(params, client);
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}
	}
}
