import { Client } from '@hashgraph/sdk';

export function getMirrorNodeUrl(client?: Client): string {
	if (!client || !client.network) {
		throw new Error('Hedera client network is not configured');
	}

	const networkName = Object.keys(client.network)[0] || '';
	return networkName.includes('mainnet')
		? 'https://mainnet.mirrornode.hedera.com'
		: 'https://testnet.mirrornode.hedera.com';
}
