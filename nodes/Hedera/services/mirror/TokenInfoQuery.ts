import { TokenInfoQuery, Client, TokenId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class TokenInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;

		const query = new TokenInfoQuery()
			.setTokenId(TokenId.fromString(tokenId));

		const tokenInfo = await query.execute(client);

		return {
			tokenId: tokenInfo.tokenId.toString(),
			name: tokenInfo.name,
			symbol: tokenInfo.symbol,
			decimals: tokenInfo.decimals,
			totalSupply: tokenInfo.totalSupply.toString(),
			treasuryAccountId: tokenInfo.treasuryAccountId?.toString() || '',
			adminKey: tokenInfo.adminKey?.toString() || '',
			kycKey: tokenInfo.kycKey?.toString() || '',
			freezeKey: tokenInfo.freezeKey?.toString() || '',
			wipeKey: tokenInfo.wipeKey?.toString() || '',
			supplyKey: tokenInfo.supplyKey?.toString() || '',
			defaultFreezeStatus: tokenInfo.defaultFreezeStatus?.toString() || '',
			defaultKycStatus: tokenInfo.defaultKycStatus?.toString() || '',
			deleted: tokenInfo.isDeleted,
			autoRenewPeriod: tokenInfo.autoRenewPeriod?.seconds?.toString() || '',
			autoRenewAccount: tokenInfo.autoRenewAccountId?.toString() || '',
			expirationTime: tokenInfo.expirationTime?.toDate()?.toISOString() || '',
			tokenMemo: tokenInfo.tokenMemo || '',
		};
	}
}