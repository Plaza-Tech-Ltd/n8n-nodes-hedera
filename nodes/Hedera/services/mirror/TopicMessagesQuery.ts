import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export interface TopicMessage extends IDataObject {
	sequenceNumber: string;
	contents: string;
	consensusTimestamp: string;
	[key: string]: any;
}

export interface TopicMessagesResult extends IDataObject {
	topicId: string;
	messages: TopicMessage[];
	messageCount: number;
	limit: number;
	[key: string]: any;
}

export class TopicMessagesQueryOperation extends BaseMirrorOperation<
	'/api/v1/topics/{topicId}/messages',
	TopicMessagesResult
> {
	constructor() {
		super(
			(params: IDataObject) => {
				const topicId = String(params.topicId);
				const limit = Number(params.limit) || 10;
				const sequenceFrom = params.sequenceFrom as number | undefined;

				let path = `/api/v1/topics/${topicId}/messages?limit=${limit}`;
				if (sequenceFrom !== undefined && sequenceFrom > 0) {
					path += `&sequenceNumber=gte:${sequenceFrom}`;
				}
				return path;
			},
			(
				data: PathResponse<'/api/v1/topics/{topicId}/messages'>,
				params: IDataObject,
			): TopicMessagesResult => {
				const topicId = String(params.topicId);
				const limit = Number(params.limit) || 10;

				const messages: TopicMessage[] = (data.messages || []).map((msg) => ({
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
			},
		);
	}
}
