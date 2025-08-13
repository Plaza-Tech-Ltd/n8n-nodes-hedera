import { Client } from '@hashgraph/sdk';
import { IHederaCredentials } from './types';

export class HederaClientFactory {
	static createClient(credentials: IHederaCredentials): Client {
		const { accountId, privateKey, network } = credentials;

		let client: Client;
		switch (network) {
			case 'mainnet':
				client = Client.forMainnet();
				break;
			case 'testnet':
				client = Client.forTestnet();
				break;
			case 'previewnet':
				client = Client.forPreviewnet();
				break;
			default:
				throw new Error(`Unsupported network: ${network}`);
		}

		client.setOperator(accountId, privateKey);
		return client;
	}

	static validateCredentials(credentials: IHederaCredentials): void {
		if (!credentials?.accountId || !credentials.privateKey) {
			throw new Error('Hedera credentials are not set up correctly.');
		}
	}
}
