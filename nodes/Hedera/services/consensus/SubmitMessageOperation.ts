import {
	Client,
	TopicMessageSubmitTransaction,
	TopicId,
	TransactionResponse,
	TransactionReceipt,
	TransactionRecord,
	PrivateKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class SubmitMessageOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const topicId = params.topicId as string;
		const message = params.message as string;
		const submitKey = params.submitKey as string | undefined;

		// Check message size (Hedera limit is 1024 bytes)
		const messageBytes = new TextEncoder().encode(message);
		if (messageBytes.length > 1024) {
			throw new Error(
				`Message size (${messageBytes.length} bytes) exceeds maximum limit of 1024 bytes`,
			);
		}

		const transaction = new TopicMessageSubmitTransaction().setTopicId(topicId).setMessage(message);

		let response: TransactionResponse;

		// If a custom submit key is provided, sign with that key
		if (submitKey && submitKey.trim()) {
			let privateKey: PrivateKey;
			try {
				privateKey = PrivateKey.fromString(submitKey.trim());
			} catch (error) {
				throw new Error(`Invalid submit key format: ${error}`);
			}

			// Sign the transaction with the provided private key
			const signedTx = await transaction.sign(privateKey);
			response = await signedTx.execute(client);
		} else {
			// Use the client's default operator key
			response = await transaction.execute(client);
		}
		const receipt: TransactionReceipt = await response.getReceipt(client);
		const record: TransactionRecord = await response.getRecord(client);

		// Check if the transaction was successful
		if (!receipt.topicSequenceNumber) {
			throw new Error(`Message submission failed: ${receipt.status.toString()}`);
		}

		return {
			status: receipt.status.toString(),
			topicId,
			message,
			messageSize: messageBytes.length,
			sequenceNumber: receipt.topicSequenceNumber.toString(),
			consensusTimestamp: record.consensusTimestamp?.toString() || 'N/A',
			transactionId: response.transactionId?.toString() || '',
		};
	}
}
