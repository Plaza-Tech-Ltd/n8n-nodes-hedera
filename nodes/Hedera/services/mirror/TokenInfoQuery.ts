import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './MirrorConfig';

export class TokenInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const tokenId = String(params.tokenId);
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const { data, error } = await mirrorClient.GET('/api/v1/tokens/{tokenId}', {
			params: {
				path: { tokenId },
			},
		});

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		return data;
	}
}
