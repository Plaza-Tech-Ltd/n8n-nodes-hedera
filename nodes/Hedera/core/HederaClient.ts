import { Client, PrivateKey } from '@hashgraph/sdk';
import { IHederaCredentials } from './types';

export class HederaClientFactory {
	static createClient(credentials: IHederaCredentials): Client {
		const { accountId, privateKey, network, keyType } = credentials;

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

		const operatorKey = this.parsePrivateKey(privateKey, keyType);
		client.setOperator(accountId, operatorKey);
		return client;
	}

	static validateCredentials(credentials: IHederaCredentials): void {
		if (!credentials?.accountId || !credentials.privateKey) {
			throw new Error('Hedera credentials are not set up correctly.');
		}
	}

	private static parsePrivateKey(privateKey: string, keyType?: 'ecdsa' | 'ed25519'): PrivateKey {
		switch (keyType) {
			case 'ecdsa':
				return PrivateKey.fromStringECDSA(privateKey);
			case 'ed25519':
				return PrivateKey.fromStringED25519(privateKey);
			default:
				throw new Error('Unable to parse Hedera private key as ECDSA or ED25519');
		}
	}
}
