import createClient from 'openapi-fetch';
import { Client, LedgerId } from '@hashgraph/sdk';
import type { paths } from '../../core/hedera-mirror';

export const getMirrorConfigFromClient = (client?: Client) => {
	if (!client?.ledgerId) throw new Error('No Ledger Id set');

	let baseUrl: string;
	switch (client.ledgerId) {
		case LedgerId.TESTNET:
			baseUrl = 'https://testnet.mirrornode.hedera.com';
			break;
		case LedgerId.PREVIEWNET:
			baseUrl = 'https://previewnet.mirrornode.hedera.com';
			break;
		case LedgerId.MAINNET:
			baseUrl = 'https://mainnet-public.mirrornode.hedera.com';
			break;
		default:
			throw new Error('Invalid Ledger ID');
	}

	const mirrorClient = createClient<paths>({ baseUrl });

	return { client: mirrorClient, baseUrl };
};
