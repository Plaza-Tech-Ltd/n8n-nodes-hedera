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
export class TokenBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const tokenId = String(params.tokenId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}/api/v1/tokens/${tokenId}`;

		const { data } = await axios.get(url);

		return {
			tokenId,
			totalSupply: data.total_supply?.toString() || '0',
		};
	}
}
