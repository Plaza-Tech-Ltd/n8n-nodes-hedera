// Updated MirrorService.ts
import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { AccountInfoQueryOperation } from './AccountInfoQuery';
import { TokenInfoQueryOperation } from './TokenInfoQuery';
import { AccountBalanceQueryOperation } from './AccountBalanceQuery';
import { AccountTokensQueryOperation } from './AccountTokensQuery';
import { TokenBalanceQueryOperation } from './TokenBalanceQuery';
import { TopicMessagesQueryOperation } from './TopicMessagesQuery';

export class MirrorService implements IHederaService {
	private accountInfoQuery = new AccountInfoQueryOperation();
	private tokenInfoQuery = new TokenInfoQueryOperation();
	private accountBalanceQuery = new AccountBalanceQueryOperation();
	private accountTokensQuery = new AccountTokensQueryOperation();
	private tokenBalanceQuery = new TokenBalanceQueryOperation();
	private topicMessagesQuery = new TopicMessagesQueryOperation();

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
					{
						name: 'Get Account HBAR Balance',
						value: 'accountBalance',
						description: 'Get HBAR balance for an account',
					},
					{
						name: 'Get Account Info',
						value: 'accountInfo',
						description: 'Get account information from mirror node',
					},
					{
						name: 'Get Account Tokens',
						value: 'accountTokens',
						description: 'Get all tokens held by an account',
					},
					{
						name: 'Get Token Balance',
						value: 'tokenBalance',
						description: 'Get token balance for a specific account and token',
					},
					{
						name: 'Get Token Info',
						value: 'tokenInfo',
						description: 'Get token information from mirror node',
					},
					{
						name: 'Get Topic Messages',
						value: 'topicMessages',
						description: 'Get messages from a consensus topic',
					},
				],
				default: 'accountInfo',
			},
			// Account ID for account info query
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
			// Token ID for token info query
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
			// Account ID for balance query
			{
				displayName: 'Account ID',
				name: 'balanceAccountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['accountBalance'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera account ID to get HBAR balance for',
				required: true,
			},
			// Account ID for tokens query
			{
				displayName: 'Account ID',
				name: 'tokensAccountId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['accountTokens'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera account ID to get tokens for',
				required: true,
			},

			// Token ID for token balance query
			{
				displayName: 'Token ID',
				name: 'tokenBalanceTokenId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['tokenBalance'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera token ID to check balance for',
				required: true,
			},
			// Topic ID for messages query
			{
				displayName: 'Topic ID',
				name: 'topicId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['topicMessages'],
					},
				},
				default: '',
				placeholder: '0.0.12345',
				description: 'The Hedera topic ID to get messages from',
				required: true,
			},
			// Optional parameters for topic messages
			{
				displayName: 'Message Limit',
				name: 'messageLimit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['topicMessages'],
					},
				},
				default: 10,
				description: 'Maximum number of messages to retrieve (1-100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Sequence Number From',
				name: 'sequenceFrom',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['mirror'],
						mirrorOperation: ['topicMessages'],
					},
				},
				default: '',
				description: 'Get messages starting from this sequence number (optional)',
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

		// Mirror queries don't need the accountId parameter since they're read-only
		switch (operation) {
			case 'accountInfo':
				params.accountId = getNodeParameter('accountId', itemIndex);
				break;
			case 'tokenInfo':
				params.tokenId = getNodeParameter('mirrorTokenId', itemIndex);
				break;
			case 'accountBalance':
				params.accountId = getNodeParameter('balanceAccountId', itemIndex);
				break;
			case 'accountTokens':
				params.accountId = getNodeParameter('tokensAccountId', itemIndex);
				break;
			case 'tokenBalance':
				params.tokenId = getNodeParameter('tokenBalanceTokenId', itemIndex);
				break;
			case 'topicMessages':
				params.topicId = getNodeParameter('topicId', itemIndex);
				params.limit = getNodeParameter('messageLimit', itemIndex);
				const sequenceFrom = getNodeParameter('sequenceFrom', itemIndex);
				if (sequenceFrom) {
					params.sequenceFrom = sequenceFrom;
				}
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
			case 'accountBalance':
				return this.accountBalanceQuery.execute(params, client);
			case 'accountTokens':
				return this.accountTokensQuery.execute(params, client);
			case 'tokenBalance':
				return this.tokenBalanceQuery.execute(params, client);
			case 'topicMessages':
				return this.topicMessagesQuery.execute(params, client);
			default:
				throw new Error(`Unsupported mirror operation: ${operation}`);
		}
	}
}
