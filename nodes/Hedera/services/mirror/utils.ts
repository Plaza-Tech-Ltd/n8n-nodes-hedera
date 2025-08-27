import { Client, LedgerId } from '@hashgraph/sdk';

export function getMirrorNodeUrl(client?: Client): string {
	if (!client?.ledgerId) throw new Error('No Ledger Id set');

	switch (client.ledgerId) {
		case LedgerId.TESTNET:
			return 'https://testnet.mirrornode.hedera.com';
		case LedgerId.PREVIEWNET:
			return 'https://previewnet.mirrornode.hedera.com';
		case LedgerId.MAINNET:
			return 'https://mainnet.mirrornode.hedera.com';
		default:
			throw new Error('Invalid Ledger ID');
	}
}
