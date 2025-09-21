import { TransferTransaction, Hbar, Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class TransferOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const recipientId = params.recipientId as string;
		const amount = params.amount as number;
		const senderAccountId = params.senderAccountId as string;

		const hbarAmount = new Hbar(amount);

		const txResponse = await new TransferTransaction()
			.addHbarTransfer(senderAccountId, hbarAmount.negated()) // sender
			.addHbarTransfer(recipientId, hbarAmount) // recipient
			.execute(client);

		const receipt = await txResponse.getReceipt(client);

		return {
			status: receipt.status.toString(),
			transactionId: txResponse.transactionId.toString() || '',
		};
	}
}
