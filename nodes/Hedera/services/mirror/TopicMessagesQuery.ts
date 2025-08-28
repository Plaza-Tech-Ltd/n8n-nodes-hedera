import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorNodeUrl } from './utils';

export class TopicMessagesQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const topicId = String(params.topicId);
		const limit = Number(params.limit) || 10;
		const sequenceFrom = params.sequenceFrom as number | undefined;
		const mirrorNodeUrl = getMirrorNodeUrl(client);

		let url = `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}`;
		if (sequenceFrom !== undefined && sequenceFrom > 0) {
			url += `&sequenceNumber=gte:${sequenceFrom}`;
		}

		const { data } = await axios.get(url);
		const messages = (data.messages || []).map((msg: any) => ({
			sequenceNumber: msg.sequence_number?.toString() || '',
			contents: msg.message ? Buffer.from(msg.message, 'base64').toString('utf8') : '',
			consensusTimestamp: msg.consensus_timestamp
				? new Date(Number(msg.consensus_timestamp) * 1000).toISOString()
				: '',
		}));

		return {
			topicId,
			messages,
			messageCount: messages.length,
			limit,
		};
	}
}
