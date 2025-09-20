import { TransferTransaction, Client, TokenId, NftId, AccountId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class TransferNFTOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const serialNumber = params.serialNumber as number;
		const fromAccountId = params.fromAccountId as string;
		const toAccountId = params.toAccountId as string;

		const nftId = new NftId(TokenId.fromString(tokenId), serialNumber);

		const transferTx = new TransferTransaction().addNftTransfer(
			nftId,
			AccountId.fromString(fromAccountId),
			AccountId.fromString(toAccountId),
		);

		const txResponse = await transferTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		return {
			status: receipt.status.toString(),
			tokenId: tokenId,
			serialNumber: serialNumber,
			fromAccountId: fromAccountId,
			toAccountId: toAccountId,
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
