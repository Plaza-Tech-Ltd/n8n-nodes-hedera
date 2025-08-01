import { TokenCreateTransaction, Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateTokenOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenName = params.tokenName as string;
		const tokenSymbol = params.tokenSymbol as string;
		const tokenDecimals = params.tokenDecimals as number;
		const initialSupply = params.initialSupply as number;
		const treasuryAccountId = params.treasuryAccountId as string;

		const tokenCreateTx = new TokenCreateTransaction()
			.setTokenName(tokenName)
			.setTokenSymbol(tokenSymbol)
			.setDecimals(tokenDecimals)
			.setInitialSupply(initialSupply)
			.setTreasuryAccountId(treasuryAccountId);

		const txResponse = await tokenCreateTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		const tokenId = receipt.tokenId;
		const transactionId = txResponse.transactionId;

		if (!tokenId) {
			throw new Error(`Token creation failed: ${receipt.status.toString()}`);
		}

		return {
			tokenId: tokenId.toString(),
			symbol: tokenSymbol,
			name: tokenName,
			decimals: tokenDecimals,
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: transactionId?.toString() || '',
		};
	}
}