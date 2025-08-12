import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateTokenOperation } from './CreateTokenOperation';
import { AirdropOperation } from './AirdropOperation';
import { CreateNonFungibleTokenOperation } from './CreateNonFungibleTokenOperation';
import { NonFungibleTokenMintOperation } from './NonFungibleTokenMintOperation';

export class TokenService implements IHederaService {
	private createTokenOperation = new CreateTokenOperation();
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
				displayName: 'Metadata Storage',
				name: 'metadataStorage',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
					},
				},
				options: [
					{
						name: 'Store Metadata On-Chain',
						value: 'onchain',
						description: 'Store metadata directly on Hedera (limited to ~100 bytes)',
					},
					{
						name: 'Reference External Metadata (Recommended)',
						value: 'external',
						description: 'Reference metadata from IPFS or web server (unlimited size)',
					},
				],
				default: 'external',
				description:
					'How to store your NFT metadata - external storage recommended for rich metadata',
			},
			{
				displayName: 'NFT Name',
				name: 'nftName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: 'Example NFT 001',
				description: 'The full name of the NFT (HIP-412 required field)',
				required: true,
			},
			{
				displayName: 'Asset Type',
				name: 'assetType',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				options: [
					{ name: 'Audio (MP3)', value: 'audio/mp3' },
					{ name: 'Custom', value: 'custom' },
					{ name: 'Document (PDF)', value: 'application/pdf' },
					{ name: 'Image (GIF)', value: 'image/gif' },
					{ name: 'Image (JPEG)', value: 'image/jpeg' },
					{ name: 'Image (PNG)', value: 'image/png' },
					{ name: 'Image (SVG)', value: 'image/svg+xml' },
					{ name: 'Video (MP4)', value: 'video/mp4' },
				],
				default: 'image/png',
				description: 'MIME type of the asset (HIP-412 required field)',
				required: true,
			},
			{
				displayName: 'Custom MIME Type',
				name: 'customMimeType',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
						assetType: ['custom'],
					},
				},
				default: '',
				placeholder: 'application/json',
				description: 'Custom MIME type for the asset',
				required: true,
			},
			{
				displayName: 'Image URI',
				name: 'imageUri',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: 'https://myserver.com/image.png or ipfs://QmHash...',
				description: 'URI pointing to the asset image (HIP-412 required field)',
				required: true,
			},
			{
				displayName: 'Description',
				name: 'nftDescription',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: 'This describes my NFT',
				description: 'Description of the NFT (HIP-412 optional field)',
				typeOptions: {
					rows: 3,
				},
			},
			{
				displayName: 'Creator',
				name: 'creator',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: 'Jane Doe, John Doe',
				description: 'Creator(s) of the NFT (HIP-412 optional field)',
			},
			{
				displayName: 'Creator DID',
				name: 'creatorDID',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder:
					'did:hedera:mainnet:7Prd74ry1Uct87nZqL3ny7aR7Cg46JamVbJgk8azVgUm;hedera:mainnet:fid=0.0.123',
				description: 'Decentralized identifier for the creator (HIP-412 optional field)',
			},
			{
				displayName: 'External URL',
				name: 'externalUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: 'https://nft.com/mycollection/001',
				description: 'External URL for the NFT (HIP-412 optional field)',
			},
			{
				displayName: 'Attributes',
				name: 'attributes',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['onchain'],
					},
				},
				default: '',
				placeholder: '[{"trait_type": "color", "display_type": "color", "value": "rgb(255,0,0)"}]',
				description: 'NFT attributes as JSON array (HIP-412 optional field)',
				typeOptions: {
					rows: 3,
				},
			},
			// External Metadata URI
			{
				displayName: 'Metadata URI',
				name: 'metadataUri',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['token'],
						tokenOperation: ['mintNft'],
						metadataStorage: ['external'],
					},
				},
				default: '',
				placeholder: 'ipfs://QmHash... or https://myserver.com/metadata.json',
				description: 'URI pointing to your HIP-412 compliant metadata JSON file',
				required: true,
			},
			// Airdrop properties
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
				params.supplyKey = getNodeParameter('mintSupplyKey', itemIndex);
				params.metadataStorage = getNodeParameter('metadataStorage', itemIndex);

				if (params.metadataStorage === 'onchain') {
					params.nftName = getNodeParameter('nftName', itemIndex);
					params.assetType = getNodeParameter('assetType', itemIndex);
					if (params.assetType === 'custom') {
						params.customMimeType = getNodeParameter('customMimeType', itemIndex);
					}
					params.imageUri = getNodeParameter('imageUri', itemIndex);
					params.nftDescription = getNodeParameter('nftDescription', itemIndex, '');
					params.creator = getNodeParameter('creator', itemIndex, '');
					params.creatorDID = getNodeParameter('creatorDID', itemIndex, '');
					params.externalUrl = getNodeParameter('externalUrl', itemIndex, '');
					params.attributes = getNodeParameter('attributes', itemIndex, '');
				} else if (params.metadataStorage === 'external') {
					params.metadataUri = getNodeParameter('metadataUri', itemIndex);
				}
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
