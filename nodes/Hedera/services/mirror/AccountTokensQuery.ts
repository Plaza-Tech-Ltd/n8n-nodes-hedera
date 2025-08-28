import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorNodeUrl } from './utils';

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const accountId = String(params.accountId);
		const mirrorNodeUrl = getMirrorNodeUrl(client);

		const { data } = await axios.get(
			`${mirrorNodeUrl}/api/v1/accounts/${accountId}/tokens?limit=100`,
		);

		return data;
	}
}
