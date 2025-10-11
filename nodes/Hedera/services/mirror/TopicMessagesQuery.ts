import { IDataObject } from 'n8n-workflow';
import { IBaseOperation } from '../../core/types';
import { Client } from '@hashgraph/sdk';
import { getMirrorConfigFromClient } from './utils';
import { paths } from '../../core/hedera-mirror';

type MirrorTopicMessagesResponse =
	paths['/api/v1/topics/{topicId}/messages']['get']['responses'][200]['content']['application/json'];

type MirrorTopicMessage = NonNullable<MirrorTopicMessagesResponse['messages']>[number];

interface TopicMessageEntry {
	sequenceNumber: string;
	contents: string;
	consensusTimestamp: string;
	payerAccountId?: string;
	runningHash?: string;
	topicId?: string;
}

interface TopicMessagesResult extends IDataObject {
	topicId: string;
	messages: TopicMessageEntry[];
	messageCount: number;
	limit: number;
	links?: MirrorTopicMessagesResponse['links'];
}

export class TopicMessagesQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client?: Client): Promise<TopicMessagesResult> {
		const topicId = String(params.topicId);
		const limit = Number(params.limit) || 10;
		const sequenceFrom = params.sequenceFrom as number | undefined;
		const { client: mirrorClient } = getMirrorConfigFromClient(client);

		const queryParams: Record<string, number | string> = { limit };
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

		const topicResponse = data as MirrorTopicMessagesResponse;

		const messages = (topicResponse.messages ?? []).map((msg: MirrorTopicMessage) => ({
			sequenceNumber: msg.sequence_number?.toString() ?? '',
			contents: msg.message ? Buffer.from(msg.message, 'base64').toString('utf8') : '',
			consensusTimestamp: msg.consensus_timestamp
				? new Date(Number(msg.consensus_timestamp.split('.')[0]) * 1000).toISOString()
				: '',
			payerAccountId: msg.payer_account_id ?? undefined,
			runningHash: msg.running_hash ?? undefined,
			topicId: msg.topic_id ?? undefined,
		}));

		return {
			topicId,
			messages,
			messageCount: messages.length,
			limit,
			links: topicResponse.links,
		};
	}
}
