import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';

function getMirrorNodeUrl(client?: Client): string {
	if (!client?.network) return 'https://testnet.mirrornode.hedera.com';

	const networkName = Object.keys(client.network)[0] || '';
	return networkName.includes('mainnet')
		? 'https://mainnet.mirrornode.hedera.com'
		: 'https://testnet.mirrornode.hedera.com';
}

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);

		const { data } = await axios.get(`${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens`);
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
