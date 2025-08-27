import { TokenAirdropTransaction, Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class AirdropOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const recipientAccountId = params.recipientAccountId as string;
		const airdropAmount = params.airdropAmount as number;
		const senderAccountId = params.senderAccountId as string;

		const airdropTx = new TokenAirdropTransaction()
			.addTokenTransfer(tokenId, senderAccountId, -airdropAmount) // sender (negative)
			.addTokenTransfer(tokenId, recipientAccountId, airdropAmount); // recipient (positive)

		const txResponse = await airdropTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		return {
			status: receipt.status.toString(),
			tokenId: tokenId,
			recipientAccountId: recipientAccountId,
			amount: airdropAmount,
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
