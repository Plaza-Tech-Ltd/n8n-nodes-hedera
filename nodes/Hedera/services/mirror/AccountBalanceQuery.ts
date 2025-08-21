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

export class AccountBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

		const { data } = await axios.get(url);
		const hbarBalanceTinybars = data.balance?.balance?.toString() || '0';
		const hbarBalance = (Number(hbarBalanceTinybars) / 1e8).toString();

		return {
			accountId,
			hbarBalance,
		};
	}
}
