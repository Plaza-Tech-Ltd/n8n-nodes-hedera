import {
	Client,
	TopicMessageSubmitTransaction,
	TopicId,
	TransactionResponse,
	TransactionReceipt,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class SubmitMessageOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		try {
			const { topicId, message } = params;

			// Validate required parameters
			if (!topicId || typeof topicId !== 'string') {
				return {
					success: false,
					error: 'Topic ID is required and must be a string',
				};
			}

			if (!message || typeof message !== 'string') {
				return {
					success: false,
					error: 'Message is required and must be a string',
				};
			}

			// Parse topic ID
			let parsedTopicId: TopicId;
			try {
				parsedTopicId = TopicId.fromString(topicId.trim());
			} catch (error) {
				return {
					success: false,
					error: `Invalid topic ID format. Use format like 0.0.1234`,
				};
			}

			// Create and execute the message submission transaction
			const transaction = new TopicMessageSubmitTransaction()
				.setTopicId(parsedTopicId)
				.setMessage(message);

			const response: TransactionResponse = await transaction.execute(client);
			const receipt: TransactionReceipt = await response.getReceipt(client);

			// Calculate message size in bytes
			const messageSize = new TextEncoder().encode(message).length;

			return {
				success: true,
				data: {
					transactionId: response.transactionId.toString(),
					topicId: topicId.trim(),
					// consensusTimestamp: receipt.consensusTimestamp?.toString(),
					messageSize: messageSize,
					message: message,
					sequenceNumber: receipt.topicSequenceNumber?.toString() || 'N/A',
				},
			};
		} catch (error) {
			// Handle common HCS errors with user-friendly messages
			let errorMessage = (error as Error).message;

			if (errorMessage.includes('INVALID_TOPIC_ID')) {
				errorMessage = 'Invalid topic ID. Make sure the topic exists and use format like 0.0.1234';
			} else if (errorMessage.includes('UNAUTHORIZED')) {
				errorMessage = 'Cannot submit to this topic. It may require special permissions.';
			} else if (errorMessage.includes('TOPIC_EXPIRED')) {
				errorMessage = 'This topic has expired and no longer accepts messages';
			} else if (errorMessage.includes('MESSAGE_SIZE_TOO_LARGE')) {
				errorMessage = 'Message is too large. Maximum size is 1024 bytes.';
			}

			return {
				success: false,
				error: `Failed to submit message: ${errorMessage}`,
			};
		}
	}
}
