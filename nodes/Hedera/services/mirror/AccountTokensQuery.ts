import { IDataObject } from 'n8n-workflow';
import { IBaseOperation } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './utils';
import { paths } from '../../core/hedera-mirror';

type MirrorAccountTokens =
	paths['/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens']['get']['responses'][200]['content']['application/json'];

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<MirrorAccountTokens> {
		const accountId = String(params.accountId);
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const { data, error } = await mirrorClient.GET(
			'/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens',
			{
				params: {
					path: { idOrAliasOrEvmAddress: accountId },
					query: { limit: 100 },
				},
			},
		);

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		return data as MirrorAccountTokens;
	}
}
