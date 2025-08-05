import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateTokenOperation } from './CreateTokenOperation';
import { AirdropOperation } from './AirdropOperation';
import { CreateNftOperation } from './CreateNftOperation';
import { MintNftOperation } from './MintNftOperation';

export class TokenService implements IHederaService {
	private createTokenOperation = new CreateTokenOperation();
	private airdropOperation = new AirdropOperation();
	private createNftOperation = new CreateNftOperation();
	private mintNftOperation = new MintNftOperation();

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
						name: 'Create NFT',
						value: 'createNft',
						description: 'Create a new non-fungible token (NFT)',
					},
					{
						name: 'Mint NFT',
						value: 'mintNft',
						description: 'Mint a new NFT instance with metadata',
					},
					{
						name: 'Airdrop Token',
						value: 'airdrop',
						description: 'Airdrop tokens to multiple accounts',
					},
				],
				default: 'create',
			},
			// FT properties
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
			// NFT only
			{
				displayName: 'Max Supply',
				name: 'maxSupply',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createNft'],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description:
					'The maximum supply of NFTs (usually 1 for a single NFT, or higher for a collection)',
				required: true,
			},
			{
				displayName: 'Supply Type',
				name: 'supplyType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createNft'],
					},
				},
				options: [
					{ name: 'Finite', value: 'FINITE', description: 'Fixed supply' },
					{ name: 'Infinite', value: 'INFINITE', description: 'Unlimited supply' },
				],
				default: 'FINITE',
				description: 'Whether the NFT supply is finite or infinite',
				required: true,
			},
			{
				displayName: 'Supply Key',
				name: 'supplyKey',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['createNft'],
					},
				},
				default: '',
				placeholder: '302e020100300506032b657004220420... (private key)',
				description:
					'Private key for minting/burning NFTs. Optional: If not provided, a new key will be generated and returned. Save this key securely! If lost, you cannot mint or burn NFTs.',
			},
			// Mint NFT properties
			{
				displayName: 'Token ID',
				name: 'mintTokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The ID of the NFT token to mint',
				required: true,
			},
			{
				displayName: 'Metadata',
				name: 'metadata',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
					},
				},
				default: '',
				placeholder: '{"name": "My NFT", "description": "A unique NFT"}',
				description: 'Metadata for the NFT (JSON string or plain text)',
				required: true,
			},
			{
				displayName: 'Supply Key',
				name: 'mintSupplyKey',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
					},
				},
				default: '',
				placeholder: '302e020100300506032b657004220420... (private key)',
				description: 'Private key required to mint NFTs for this token',
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
				params.treasuryAccountId = accountId;
				break;
			case 'createNft':
				params.tokenName = getNodeParameter('tokenName', itemIndex);
				params.tokenSymbol = getNodeParameter('tokenSymbol', itemIndex);
				params.maxSupply = getNodeParameter('maxSupply', itemIndex);
				params.supplyType = getNodeParameter('supplyType', itemIndex);
				params.treasuryAccountId = accountId;
				break;
			case 'mintNft':
				params.tokenId = getNodeParameter('mintTokenId', itemIndex);
				params.metadata = getNodeParameter('metadata', itemIndex);
				params.supplyKey = getNodeParameter('mintSupplyKey', itemIndex);
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
				return this.createTokenOperation.execute(params, client);
			case 'createNft':
				return this.createNftOperation.execute(params, client);
			case 'mintNft':
				return this.mintNftOperation.execute(params, client);
			case 'airdrop':
				return this.airdropOperation.execute(params, client);
			default:
				throw new Error(`Unsupported token operation: ${operation}`);
		}
	}
}
