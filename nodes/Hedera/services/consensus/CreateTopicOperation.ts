import {
	Client,
	TopicCreateTransaction,
	TransactionResponse,
	TransactionReceipt,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class CreateTopicOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		try {
			const { topicMemo } = params;

			// Create the topic creation transaction
			let transaction = new TopicCreateTransaction();

			// Set memo if provided
			if (topicMemo && typeof topicMemo === 'string' && topicMemo.trim()) {
				transaction = transaction.setTopicMemo(topicMemo.trim());
			}

			// Execute the transaction (uses operator key by default)
			const response: TransactionResponse = await transaction.execute(client);

			// Get the receipt to obtain the topic ID
			const receipt: TransactionReceipt = await response.getReceipt(client);
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
					// consensusTimestamp: receipt.consensusTimestamp?.toString(),
					topicMemo: topicMemo || '',
					isPublic: true, // Always public when using operator key only
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
