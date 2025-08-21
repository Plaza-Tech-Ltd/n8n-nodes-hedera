// AccountTokensQuery.ts
import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';

function getMirrorNodeUrl(params: IDataObject, client?: Client): string {
	if (params.mirrorNodeUrl) return params.mirrorNodeUrl as string;
	if (client) {
		const network = client.network && Object.keys(client.network)[0];
		if (network && network.includes('testnet')) return 'https://testnet.mirrornode.hedera.com';
		if (network && network.includes('mainnet')) return 'https://mainnet.mirrornode.hedera.com';
		if (network && network.includes('previewnet'))
			return 'https://previewnet.mirrornode.hedera.com';
	}
	return 'https://testnet.mirrornode.hedera.com';
}

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = params.accountId as string;
		const mirrorNodeUrl = getMirrorNodeUrl(params, client);
		const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

		const response = await axios.get(url);
		const data = response.data;

		const tokensArr = data.tokens || [];
		const tokens = tokensArr.map((token: any) => ({
			tokenId: token.token_id,
			balance: token.balance.toString(),
			decimals: null, // Mirror Node account tokens endpoint does not provide decimals
		}));

		return {
			accountId: accountId,
			tokens,
			tokenCount: tokens.length,
			hbarBalance: data.balance?.balance?.toString() || '0',
		};
	}
}
