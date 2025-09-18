import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './MirrorConfig';

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
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

		return data;
	}
}
