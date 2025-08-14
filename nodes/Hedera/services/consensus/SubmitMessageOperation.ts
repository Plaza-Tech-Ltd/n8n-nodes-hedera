import {
	Client,
	TopicMessageSubmitTransaction,
	TopicId,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class SubmitMessageOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const topicId = params.topicId as string;
		const message = params.message as string;

		const transaction = new TopicMessageSubmitTransaction()
			.setTopicId(TopicId.fromString(topicId))
			.setMessage(message);

		const response: TransactionResponse = await transaction.execute(client);
		const receipt: TransactionReceipt = await response.getReceipt(client);
		const record: TransactionRecord = await response.getRecord(client);

		const messageSize = new TextEncoder().encode(message).length;

		return {
			topicId,
			message,
			messageSize,
			sequenceNumber: receipt.topicSequenceNumber?.toString() || 'N/A',
			consensusTimestamp: record.consensusTimestamp?.toString() || 'N/A',
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: response.transactionId?.toString() || '',
		};
	}
}
