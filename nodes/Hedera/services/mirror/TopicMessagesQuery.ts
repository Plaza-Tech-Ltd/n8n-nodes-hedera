import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './MirrorConfig';

export class TopicMessagesQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const topicId = String(params.topicId);
		const limit = Number(params.limit) || 10;
		const sequenceFrom = params.sequenceFrom as number | undefined;
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const queryParams: any = { limit };
		if (sequenceFrom !== undefined && sequenceFrom > 0) {
			queryParams.sequencenumber = `gte:${sequenceFrom}`;
		}

		const { data, error } = await mirrorClient.GET('/api/v1/topics/{topicId}/messages', {
			params: {
				path: { topicId },
				query: queryParams,
			},
		});

		if (error) {
			throw new Error(`Mirror node error: ${JSON.stringify(error)}`);
		}

		if (!data) {
			throw new Error('No data returned from mirror node');
		}

		const messages = (data.messages || []).map((msg: any) => ({
			sequenceNumber: msg.sequence_number?.toString() || '',
			contents: msg.message ? Buffer.from(msg.message, 'base64').toString('utf8') : '',
			consensusTimestamp: msg.consensus_timestamp
				? new Date(Number(msg.consensus_timestamp.split('.')[0]) * 1000).toISOString()
				: '',
			payerAccountId: msg.payer_account_id,
			runningHash: msg.running_hash,
			topicId: msg.topic_id,
		}));

		return {
			topicId,
			messages,
			messageCount: messages.length,
			limit,
			links: data.links,
		};
	}
}
