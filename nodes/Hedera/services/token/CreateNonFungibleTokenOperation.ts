import {
	TokenCreateTransaction,
	TokenType,
	TokenSupplyType,
	Client,
	PublicKey,
} from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateNonFungibleTokenOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenName = params.tokenName as string;
		const tokenSymbol = params.tokenSymbol as string;
		const treasuryAccountId = params.treasuryAccountId as string;
		const supplyType = params.supplyType as string;
		const maxSupply = params.maxSupply as number | undefined;

		// Use client's operator key as supply key
		const operatorPublicKey = client.operatorPublicKey as PublicKey | null;
		if (!operatorPublicKey) {
			throw new Error('Client operator key is not configured. Please set credentials.');
		}

		const tokenCreateTx = new TokenCreateTransaction()
			.setTokenName(tokenName)
			.setTokenSymbol(tokenSymbol)
			.setTokenType(TokenType.NonFungibleUnique)
			.setDecimals(0)
			.setTreasuryAccountId(treasuryAccountId)
			.setSupplyType(supplyType === 'FINITE' ? TokenSupplyType.Finite : TokenSupplyType.Infinite)
			.setSupplyKey(operatorPublicKey);

		// Only set maxSupply if supply type is finite and maxSupply is provided
		if (supplyType === 'FINITE' && maxSupply !== undefined) {
			tokenCreateTx.setMaxSupply(maxSupply);
		}

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
			maxSupply: maxSupply || 'unlimited',
			supplyType,
			supplyKey: operatorPublicKey.toString(),
			status: receipt.status.toString(),
			transactionId: transactionId?.toString() || '',
		};
	}
}
