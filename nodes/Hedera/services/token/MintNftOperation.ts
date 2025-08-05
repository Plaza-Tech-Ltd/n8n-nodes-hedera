import { TokenMintTransaction, Client, PrivateKey } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class MintNftOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const metadata = params.metadata as string;
		const supplyKey = params.supplyKey as string;

		// Create the supply key from the provided private key
		const supplyPrivateKey = PrivateKey.fromString(supplyKey);

		const mintTx = new TokenMintTransaction()
			.setTokenId(tokenId)
			.setMetadata([Buffer.from(metadata, 'utf8')]);

		// Sign the transaction with the supply key
		mintTx.freezeWith(client);
		mintTx.sign(supplyPrivateKey);

		// Execute transaction
		const txResponse = await mintTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		const transactionId = txResponse.transactionId;

		if (receipt.status.toString() !== 'SUCCESS') {
			throw new Error(`NFT minting failed: ${receipt.status.toString()}`);
		}

		return {
			tokenId: tokenId,
			metadata: metadata,
			status: 'SUCCESS',
			transactionId: transactionId?.toString() || '',
		};
	}
}
