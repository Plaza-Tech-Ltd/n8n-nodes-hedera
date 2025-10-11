import { IDataObject } from 'n8n-workflow';
import { IBaseOperation } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './utils';
import { paths } from '../../core/hedera-mirror';

type MirrorTokenBalances =
	paths['/api/v1/tokens/{tokenId}/balances']['get']['responses'][200]['content']['application/json'];

export class TokenBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<MirrorTokenBalances> {
		const tokenId = String(params.tokenId);
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const { data, error } = await mirrorClient.GET('/api/v1/tokens/{tokenId}/balances', {
			params: {
				path: { tokenId },
				query: { order: 'desc' },
			},
		});

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		return data as MirrorTokenBalances;
	}
}
