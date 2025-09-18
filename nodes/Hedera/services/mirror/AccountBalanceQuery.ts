import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client, Hbar, HbarUnit } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './MirrorConfig';

export class AccountBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
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

		const hbarBalanceTinybars = data.balance?.balance?.toString() || '0';
		const hbarBalance = Hbar.fromTinybars(hbarBalanceTinybars).to(HbarUnit.Hbar).toString();

		return {
			accountId,
			hbarBalance,
			accountData: data,
		};
	}
}
