import { Client, PrivateKey, TokenId, TokenMintTransaction } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class FtMintOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const mintAmount = params.mintAmount as number;
		const supplyKeyString = params.supplyKey as string;

		const tx = await new TokenMintTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setAmount(mintAmount)
			.freezeWith(client);

		const supplyKey = PrivateKey.fromString(supplyKeyString);
		const signedTx = await tx.sign(supplyKey);

		const txResponse = await signedTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		return {
			tokenId,
			amount: mintAmount,
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
