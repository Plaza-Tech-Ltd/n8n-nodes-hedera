import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client, Hbar, HbarUnit } from '@hashgraph/sdk';
import { getMirrorNodeUrl } from './utils';

export class AccountBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

		const { data } = await axios.get(url);
		const hbarBalanceTinybars = data.balance?.balance?.toString() || '0';
		const hbarBalance = Hbar.fromTinybars(hbarBalanceTinybars).to(HbarUnit.Hbar).toString();

		return {
			accountId,
			hbarBalance,
		};
	}
}
