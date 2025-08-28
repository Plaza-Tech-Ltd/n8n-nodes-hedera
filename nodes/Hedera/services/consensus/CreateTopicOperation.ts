import {
	Client,
	TopicCreateTransaction,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	PublicKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateTopicOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const topicMemo = params.topicMemo as string;
		const enableSubmitKey = (params.enableSubmitKey as boolean) ?? false;

		let transaction = new TopicCreateTransaction();

		if (topicMemo && typeof topicMemo === 'string' && topicMemo.trim()) {
			transaction = transaction.setTopicMemo(topicMemo.trim());
		}

		if (enableSubmitKey) {
			const operatorPublicKey = client.operatorPublicKey as PublicKey | null;
			if (!operatorPublicKey) {
				throw new Error('Client operator key is not configured. Please set credentials.');
			}
			transaction = transaction.setSubmitKey(operatorPublicKey);
		}

		const response: TransactionResponse = await transaction.execute(client);
		const receipt: TransactionReceipt = await response.getReceipt(client);
		const record: TransactionRecord = await response.getRecord(client);
		const topicId = receipt.topicId;

		if (!topicId) {
			throw new Error(`Topic creation failed: ${receipt.status.toString()}`);
		}

		return {
			status: receipt.status.toString(),
			topicId: topicId.toString(),
			transactionId: response.transactionId.toString(),
			consensusTimestamp: record.consensusTimestamp?.toString() || 'N/A',
			topicMemo: topicMemo || '',
			isPublic: !enableSubmitKey,
		};
	}
}
