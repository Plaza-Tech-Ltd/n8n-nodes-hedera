import { IDataObject } from 'n8n-workflow';
import { IBaseOperation } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './utils';
import { paths } from '../../core/hedera-mirror';

type MirrorAccountInfo =
	paths['/api/v1/accounts/{idOrAliasOrEvmAddress}']['get']['responses'][200]['content']['application/json'];

export class AccountInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<MirrorAccountInfo> {
		const accountId = String(params.accountId);
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const { data, error } = await mirrorClient.GET('/api/v1/accounts/{idOrAliasOrEvmAddress}', {
			params: {
				path: { idOrAliasOrEvmAddress: accountId },
			},
		});

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		return data as MirrorAccountInfo;
	}
}
