import { TokenAirdropTransaction, Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { TokenInfoQueryOperation } from '../mirror/TokenInfoQuery';

export class AirdropOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const recipientAccountId = params.recipientAccountId as string;
		const airdropAmount = params.airdropAmount as number;
		const senderAccountId = params.senderAccountId as string;

		const tokenInfoOp = new TokenInfoQueryOperation();
		const tokenInfo = await tokenInfoOp.execute({ tokenId }, client);
		const decimalsRaw = (tokenInfo as IDataObject)?.decimals;
		const decimals = typeof decimalsRaw === 'string' ? parseInt(decimalsRaw, 10) : decimalsRaw;

		if (typeof decimals !== 'number' || Number.isNaN(decimals)) {
			throw new Error('Unable to fetch token decimals for airdrop.');
		}

		// Decimals conversion
		const convertedAmount = Math.round(airdropAmount * Math.pow(10, decimals));

		const airdropTx = new TokenAirdropTransaction()
			.addTokenTransfer(tokenId, senderAccountId, -convertedAmount) // sender (negative)
			.addTokenTransfer(tokenId, recipientAccountId, convertedAmount); // recipient (positive)

		const txResponse = await airdropTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		return {
			status: receipt.status.toString(),
			tokenId: tokenId,
			recipientAccountId: recipientAccountId,
			amount: airdropAmount, // Return the original amount
			decimals: decimals,
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
