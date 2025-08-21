import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';

function getMirrorNodeUrl(params: IDataObject, client?: Client): string {
	if (params.mirrorNodeUrl) return params.mirrorNodeUrl as string;
	if (client) {
		const network = client.network && Object.keys(client.network)[0];
		if (network && network.includes('testnet')) return 'https://testnet.mirrornode.hedera.com';
		if (network && network.includes('mainnet')) return 'https://mainnet.mirrornode.hedera.com';
		if (network && network.includes('previewnet'))
			return 'https://previewnet.mirrornode.hedera.com';
	}
	return 'https://testnet.mirrornode.hedera.com';
}

export class TokenInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const tokenId = params.tokenId as string;
		const mirrorNodeUrl = getMirrorNodeUrl(params, client);
		const url = `${mirrorNodeUrl}/api/v1/tokens/${tokenId}`;

		const response = await axios.get(url);
		const data = response.data;

		return {
			tokenId: data.token_id || '',
			name: data.name || '',
			symbol: data.symbol || '',
			decimals: data.decimals,
			totalSupply: data.total_supply?.toString() || '0',
			treasuryAccountId: data.treasury_account_id || '',
			adminKey: data.admin_key || '',
			kycKey: data.kyc_key || '',
			freezeKey: data.freeze_key || '',
			wipeKey: data.wipe_key || '',
			supplyKey: data.supply_key || '',
			defaultFreezeStatus: data.default_freeze_status || '',
			defaultKycStatus: data.default_kyc_status || '',
			deleted: data.deleted || false,
			autoRenewPeriod: data.auto_renew_period?.toString() || '',
			autoRenewAccount: data.auto_renew_account || '',
			expirationTime: data.expiry_timestamp || '',
			tokenMemo: data.memo || '',
		};
	}
}
