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

export class AccountInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}/api/v1/accounts/${accountId}`;

		const { data } = await axios.get(url);

		return {
			accountId: data.account || '',
			balance: data.balance?.balance?.toString() || '0',
			memo: data.memo || '',
			expirationTime: data.expiry_timestamp
				? new Date(Number(data.expiry_timestamp) * 1000).toISOString()
				: '',
		};
	}
}
