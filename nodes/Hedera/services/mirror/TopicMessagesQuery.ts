// TopicMessagesQuery.ts
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

export class TopicMessagesQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<IOperationResult> {
		const topicId = params.topicId as string;
		const limit = (params.limit as number) || 10;
		const sequenceFrom = params.sequenceFrom as number | undefined;
		const mirrorNodeUrl = getMirrorNodeUrl(params, client);

		let url = `${mirrorNodeUrl}/api/v1/topics/${topicId}/messages?limit=${limit}`;
		if (sequenceFrom) {
			url += `&sequenceNumber=${sequenceFrom}`;
		}

		const response = await axios.get(url);
		const data = response.data;
		const messages = (data.messages || []).map((msg: any) => ({
			sequenceNumber: msg.sequence_number?.toString() || '',
			runningHash: msg.running_hash || '',
			contents: msg.message ? Buffer.from(msg.message, 'base64').toString('utf8') : '',
			consensusTimestamp: msg.consensus_timestamp || '',
		}));

		return {
			topicId,
			messages,
			messageCount: messages.length,
			limit,
			sequenceFrom: sequenceFrom || null,
		};
	}
}
