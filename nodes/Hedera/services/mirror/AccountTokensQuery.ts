import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorNodeUrl } from './utils';

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);

		const { data } = await axios.get(
			`${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens?limit=100`,
		);
		const tokens = data.tokens || [];

		const tokenDetails = await Promise.all(
			tokens.map(async (token: any) => {
				const { data: tokenInfo } = await axios.get(
					`${mirrorNodeUrl}/api/v1/tokens/${token.token_id}`,
				);
				return { ...token, type: tokenInfo.type };
			}),
		);

		const nfts = tokenDetails
			.filter((token) => token.type === 'NON_FUNGIBLE_UNIQUE')
			.map((token) => ({
				tokenId: token.token_id,
			}));

		return {
			accountId,
			nfts,
		};
	}
}
