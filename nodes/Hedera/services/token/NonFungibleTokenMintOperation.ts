import { TokenMintTransaction, Client, TokenId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class NonFungibleTokenMintOperation implements IBaseOperation {
	private readonly MAX_METADATA_SIZE = 100;

	private validateRequiredFields(params: IDataObject): void {
		if (!params.tokenId) {
			throw new Error('tokenId is required for minting NFT.');
		}

		if (!params.metadataUri) {
			throw new Error('metadataUri is required for minting NFT.');
		}
	}

	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		this.validateRequiredFields(params);

		const tokenId = params.tokenId as string;
		const metadataUri = params.metadataUri as string;

		// Convert metadata URI to buffer
		const metadataBuffer = Buffer.from(metadataUri, 'utf8');

		if (metadataBuffer.length > this.MAX_METADATA_SIZE) {
			throw new Error(
				`Metadata URI exceeds ${this.MAX_METADATA_SIZE} bytes (${metadataBuffer.length} bytes).`,
			);
		}

		const tx = await new TokenMintTransaction()
			.setTokenId(TokenId.fromString(tokenId))
			.setMetadata([metadataBuffer])
			.freezeWith(client);

		const txResponse = await tx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		if (receipt.status.toString() !== 'SUCCESS') {
			throw new Error(`Minting failed: ${receipt.status.toString()}`);
		}

		const serialNumber = receipt.serials?.[0]?.toString() ?? 'Unknown';

		return {
			success: true,
			tokenId,
			serialNumber,
			metadataUri,
			metadataSize: metadataBuffer.length,
			status: receipt.status.toString(),
			transactionId: txResponse.transactionId?.toString() || '',
			message: `NFT minted successfully with serial number: ${serialNumber}`,
		};
	}
}
