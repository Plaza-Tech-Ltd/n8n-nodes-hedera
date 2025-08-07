import { TokenMintTransaction, Client, PrivateKey } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

interface OnchainMetadata {
	format: string;
	name: string;
	image: string;
	type: string;
}

export class MintNftOperation implements IBaseOperation {
	private readonly MAX_METADATA_SIZE = 100;

	private getOnchainMetadata(params: IDataObject): Buffer {
		const metadata: OnchainMetadata = {
			format: 'HIP412@2.0.0',
			name: params.nftName as string,
			image: params.imageUri as string,
			type:
				params.assetType === 'custom'
					? (params.customMimeType as string)
					: (params.assetType as string),
		};

		const buffer = Buffer.from(JSON.stringify(metadata), 'utf8');

		if (buffer.length > this.MAX_METADATA_SIZE) {
			throw new Error(
				`On-chain metadata exceeds ${this.MAX_METADATA_SIZE} bytes (${buffer.length} bytes).`,
			);
		}

		return buffer;
	}

	private getExternalMetadata(params: IDataObject): Buffer {
		const uri = params.metadataUri as string;
		if (!uri) {
			throw new Error('metadataUri is required for external metadataStorage.');
		}

		const buffer = Buffer.from(uri, 'utf8');

		if (buffer.length > this.MAX_METADATA_SIZE) {
			throw new Error(
				`Metadata URI exceeds ${this.MAX_METADATA_SIZE} bytes (${buffer.length} bytes).`,
			);
		}

		return buffer;
	}

	private validateRequiredFields(params: IDataObject): void {
		const storage = params.metadataStorage;

		if (storage === 'onchain') {
			if (!params.nftName || !params.imageUri) {
				throw new Error('Fields "nftName" and "imageUri" are required for on-chain metadata.');
			}
			if (params.assetType === 'custom' && !params.customMimeType) {
				throw new Error('customMimeType is required when assetType is custom.');
			}
		} else if (storage === 'external') {
			if (!params.metadataUri) {
				throw new Error('metadataUri is required for external metadataStorage.');
			}
		} else {
			throw new Error(`Invalid metadataStorage: ${storage}`);
		}
	}

	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		this.validateRequiredFields(params);

		const tokenId = params.tokenId as string;
		const supplyKey = params.supplyKey as string;
		const storageType = params.metadataStorage as string;

		const supplyPrivateKey = PrivateKey.fromString(supplyKey);

		const metadataBuffer =
			storageType === 'onchain'
				? this.getOnchainMetadata(params)
				: this.getExternalMetadata(params);

		const mintTx = await new TokenMintTransaction()
			.setTokenId(tokenId)
			.setMetadata([metadataBuffer])
			.freezeWith(client)
			.sign(supplyPrivateKey);

		const txResponse = await mintTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		if (receipt.status.toString() !== 'SUCCESS') {
			throw new Error(`Minting failed: ${receipt.status.toString()}`);
		}

		const serialNumber = receipt.serials?.[0]?.toString() ?? 'Unknown';

		return {
			success: true,
			tokenId,
			serialNumber,
			metadata: metadataBuffer.toString('utf8'),
			metadataSize: metadataBuffer.length,
			metadataInputType: storageType,
			status: receipt.status.toString(),
			transactionId: txResponse.transactionId.toString(),
			message: `NFT minted successfully with serial number: ${serialNumber}`,
		};
	}
}
