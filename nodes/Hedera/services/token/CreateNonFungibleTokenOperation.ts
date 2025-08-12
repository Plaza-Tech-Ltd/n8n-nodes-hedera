import {
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	Client,
	PrivateKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateNonFungibleTokenOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenName = params.tokenName as string;
		const tokenSymbol = params.tokenSymbol as string;
		const treasuryAccountId = params.treasuryAccountId as string;
		const maxSupply = params.maxSupply as number;
		const supplyType = params.supplyType as string;

		// always auto-generate supply key
		const supplyKey = PrivateKey.generate();

		const tokenCreateTx = new TokenCreateTransaction()
			.setTokenName(tokenName)
			.setTokenSymbol(tokenSymbol)
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setTreasuryAccountId(treasuryAccountId)
			.setMaxSupply(maxSupply)
			.setSupplyType(supplyType === 'FINITE' ? TokenSupplyType.Finite : TokenSupplyType.Infinite)
			.setSupplyKey(supplyKey);

		// Execute transaction
		const txResponse = await tokenCreateTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		const tokenId = receipt.tokenId;
		const transactionId = txResponse.transactionId;

		if (!tokenId) {
			throw new Error(`NFT creation failed: ${receipt.status.toString()}`);
		}

		return {
			tokenId: tokenId.toString(),
			symbol: tokenSymbol,
			name: tokenName,
			maxSupply,
			supplyType,
			supplyKey: supplyKey.toString(),
			status: receipt.status.toString(),
			transactionId: transactionId?.toString() || '',
		};
	}
}
