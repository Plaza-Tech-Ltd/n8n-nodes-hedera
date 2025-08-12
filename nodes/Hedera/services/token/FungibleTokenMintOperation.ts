import { Client, TokenId, TokenMintTransaction } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { TokenInfoQueryOperation } from '../mirror/TokenInfoQuery';

export class FungibleTokenMintOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const amount = params.amount as number;

		const tokenInfoOp = new TokenInfoQueryOperation();
		const tokenInfo = await tokenInfoOp.execute({ tokenId }, client);
		const decimals = (tokenInfo as IDataObject)?.decimals as number | undefined;
		if (typeof decimals !== 'number' || Number.isNaN(decimals)) {
			throw new Error('Unable to fetch token decimals for minting.');
		}

		const mintedAmount = Math.round(amount * Math.pow(10, decimals));

		const tx = await new TokenMintTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setAmount(mintedAmount)
			.freezeWith(client);

		const txResponse = await tx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		return {
			tokenId,
			amount,
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
