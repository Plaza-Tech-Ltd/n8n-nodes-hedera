import {
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	Client,
	PrivateKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateNftOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenName = params.tokenName as string;
		const tokenSymbol = params.tokenSymbol as string;
		const treasuryAccountId = params.treasuryAccountId as string;
		const maxSupply = params.maxSupply as number;
		const supplyType = params.supplyType as string;
		let supplyKey: PrivateKey;
		let supplyKeyWasGenerated = false;

		// here user can provide supply key or if not then auto generate a new one

		if (
			params.supplyKey &&
			typeof params.supplyKey === 'string' &&
			params.supplyKey.trim() !== ''
		) {
			supplyKey = PrivateKey.fromString(params.supplyKey.trim());
		} else {
			supplyKey = PrivateKey.generate();
			supplyKeyWasGenerated = true;
		}

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

		const result: IOperationResult = {
			tokenId: tokenId.toString(),
			symbol: tokenSymbol,
			name: tokenName,
			maxSupply,
			supplyType,
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: transactionId?.toString() || '',
		};
		if (supplyKeyWasGenerated) {
			result.supplyKey = supplyKey.toString();
		}
		return result;
	}
}
