import {
	Client,
	TopicCreateTransaction,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class CreateTopicOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		try {
			const { topicMemo } = params;

			let transaction = new TopicCreateTransaction();

			if (topicMemo && typeof topicMemo === 'string' && topicMemo.trim()) {
				transaction = transaction.setTopicMemo(topicMemo.trim());
			}

			const response: TransactionResponse = await transaction.execute(client);

			const receipt: TransactionReceipt = await response.getReceipt(client);
			const record: TransactionRecord = await response.getRecord(client);
			const topicId = receipt.topicId;

			if (!topicId) {
				return {
					success: false,
					error: 'Failed to create topic: No topic ID returned',
				};
			}

			return {
				success: true,
				data: {
					topicId: topicId.toString(),
					transactionId: response.transactionId.toString(),
					consensusTimestamp: record.consensusTimestamp?.toString(),
					topicMemo: topicMemo || '',
					isPublic: true,
				},
			};
		} catch (error) {
			return {
				success: false,
				error: `Failed to create topic: ${(error as Error).message}`,
			};
		}
	}
}
