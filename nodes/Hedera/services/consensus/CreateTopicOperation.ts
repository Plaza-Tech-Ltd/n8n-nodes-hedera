import {
	Client,
	TopicCreateTransaction,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	PublicKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IOperationResult } from '../../core/types';

export class CreateTopicOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const { topicMemo } = params;
		const enableSubmitKey = (params.enableSubmitKey as boolean) ?? false;

		let transaction = new TopicCreateTransaction();

		if (topicMemo && typeof topicMemo === 'string' && topicMemo.trim()) {
			transaction = transaction.setTopicMemo(topicMemo.trim());
		}

		if (enableSubmitKey) {
			const operatorPublicKey = client.operatorPublicKey as PublicKey | null;
			if (!operatorPublicKey) {
				return {
					success: false,
					error:
						'Client operator key is not configured. Please set credentials or disable "Enable Submit Key".',
				};
			}
			transaction = transaction.setSubmitKey(operatorPublicKey);
		}

		const response: TransactionResponse = await transaction.execute(client);

		const receipt: TransactionReceipt = await response.getReceipt(client);
		const record: TransactionRecord = await response.getRecord(client);
		const topicId = receipt.topicId;

		if (!topicId) {
			throw new Error('Failed to create topic: No topic ID returned');
		}

		return {
			status: receipt.status.toString(),
			topicId: topicId.toString(),
			transactionId: response.transactionId.toString(),
			consensusTimestamp: record.consensusTimestamp?.toString() || 'N/A',
			topicMemo: (topicMemo as string) || '',
			isPublic: !enableSubmitKey,
		};
	}
}
