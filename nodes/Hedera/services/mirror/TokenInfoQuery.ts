import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorNodeUrl } from './utils';

export class TokenInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const tokenId = String(params.tokenId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}/api/v1/tokens/${tokenId}`;

		const { data } = await axios.get(url);

		return {
			tokenId: data.token_id || '',
			name: data.name || '',
			symbol: data.symbol || '',
			tokenMemo: data.memo || '',
			totalSupply: data.total_supply?.toString() || '0',
			treasuryAccountId: data.treasury_account_id || '',
		};
	}
}
