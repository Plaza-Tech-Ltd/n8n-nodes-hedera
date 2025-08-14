import { TokenMintTransaction, Client, TokenId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class NFTMintOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const metadataUri = params.metadataUri as string;

		const metadataBuffer = Buffer.from(metadataUri, 'utf8');

		const tx = await new TokenMintTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setMetadata([metadataBuffer])
			.freezeWith(client);

		const txResponse = await tx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		const serialNumber = receipt.serials?.[0]?.toString() ?? 'Unknown';

		return {
			tokenId,
			metadataUri,
			serialNumber,
			status: receipt.status.toString() === 'SUCCESS' ? 'SUCCESS' : receipt.status.toString(),
			transactionId: txResponse.transactionId?.toString() || '',
		};
	}
}
