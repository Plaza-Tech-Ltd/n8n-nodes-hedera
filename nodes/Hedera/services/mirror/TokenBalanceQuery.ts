import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './utils';

export class TokenBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const tokenId = String(params.tokenId);
		const accountId = params.accountId ? String(params.accountId) : undefined;
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const { data, error } = await mirrorClient.GET('/api/v1/tokens/{tokenId}/balances', {
			params: {
				path: { tokenId },
				query: {
					order: 'desc',
					...(accountId
						? {
								'account.id': accountId,
								limit: 1,
							}
						: {
								limit: 100,
							}),
				},
			},
		});

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		return data;
	}
}
