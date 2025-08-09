import { TokenCreateTransaction, Client, PrivateKey, PublicKey } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateFtTokenOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenName = params.tokenName as string;
		const tokenSymbol = params.tokenSymbol as string;
		const tokenDecimals = params.tokenDecimals as number;
		const initialSupply = params.initialSupply as number;
		const treasuryAccountId = params.treasuryAccountId as string;
		const enableSupplyKey = (params.enableSupplyKey as boolean) ?? false;

		const tokenCreateTx = new TokenCreateTransaction()
			.setTokenName(tokenName)
			.setTokenSymbol(tokenSymbol)
			.setDecimals(tokenDecimals)
			.setInitialSupply(initialSupply)
			.setTreasuryAccountId(treasuryAccountId);

		let generatedSupplyPrivateKey: PrivateKey | undefined;
		if (enableSupplyKey) {
			// Auto-generate ED25519 keypair for supply control
			generatedSupplyPrivateKey = PrivateKey.generateED25519();
			tokenCreateTx.setSupplyKey(generatedSupplyPrivateKey.publicKey as PublicKey);
		}

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
			...(generatedSupplyPrivateKey
				? {
						supplyPrivateKey: generatedSupplyPrivateKey.toString(),
					}
				: {}),
		};
	}
}
