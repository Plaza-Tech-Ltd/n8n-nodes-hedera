import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateTopicOperation } from './CreateTopicOperation';
import { SubmitMessageOperation } from './SubmitMessageOperation';

export class ConsensusService implements IHederaService {
	private createTopicOperation = new CreateTopicOperation();
	private submitMessageOperation = new SubmitMessageOperation();

	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'consensusOperation',
				type: 'options',
				displayOptions: {
					show: { resource: ['consensus'] },
				},
				options: [
					{
						name: 'Create Topic',
						value: 'createTopic',
						description: 'Create a new public consensus topic',
					},
					{
						name: 'Submit Message',
						value: 'submitMessage',
						description: 'Submit a message to a consensus topic',
					},
				],
				default: 'createTopic',
			},
			// Create Topic Parameters
			{
				displayName: 'Topic Memo',
				name: 'topicMemo',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['consensus'],
						consensusOperation: ['createTopic'],
					},
				},
				default: '',
				description: 'Optional description for the topic (max 100 characters)',
				placeholder: 'e.g., IoT Sensor Data Stream',
			},
			// Submit Message Parameters
			{
				displayName: 'Topic ID',
				name: 'topicId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['consensus'],
						consensusOperation: ['submitMessage'],
					},
				},
				default: '',
				description: 'The ID of the topic to submit the message to',
				placeholder: 'e.g., 0.0.1234',
				required: true,
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['consensus'],
						consensusOperation: ['submitMessage'],
					},
				},
				default: '',
				description: 'The message to submit to the topic (max 1024 bytes)',
				placeholder: 'Your message content here...',
				required: true,
			},
		];
	}

	extractParameters(
		operation: string,
		getNodeParameter: Function,
		itemIndex: number,
		accountId: string,
	): IDataObject {
		const params: IDataObject = {};

		switch (operation) {
			case 'createTopic':
				params.topicMemo = getNodeParameter('topicMemo', itemIndex) || '';
				params.payerAccountId = accountId; // Use authenticated account as payer
				break;
			case 'submitMessage':
				params.topicId = getNodeParameter('topicId', itemIndex);
				params.message = getNodeParameter('message', itemIndex);
				break;
			default:
				throw new Error(`Unsupported consensus operation: ${operation}`);
		}

		return params;
	}

	async execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult> {
		switch (operation) {
			case 'createTopic':
				return this.createTopicOperation.execute(params, client);
			case 'submitMessage':
				return this.submitMessageOperation.execute(params, client);
			default:
				throw new Error(`Unsupported consensus operation: ${operation}`);
		}
	}
}
