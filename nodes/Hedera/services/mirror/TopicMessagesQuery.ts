// TopicMessagesQuery.ts
import { TopicMessageQuery, Client, TopicId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class TopicMessagesQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const topicId = params.topicId as string;
		const limit = (params.limit as number) || 10;
		const sequenceFrom = params.sequenceFrom as number;

		return new Promise((resolve, reject) => {
			const messages: any[] = [];
			let messageCount = 0;

			const query = new TopicMessageQuery().setTopicId(TopicId.fromString(topicId)).setLimit(limit);

			if (sequenceFrom) {
				query.setStartTime(0); // Set to beginning of time to use sequence number
			}

			const subscription = query.subscribe(client, null, (message) => {
				// If sequenceFrom is specified, filter messages
				if (sequenceFrom && message.sequenceNumber.toNumber() < sequenceFrom) {
					return;
				}

				const messageData = {
					sequenceNumber: message.sequenceNumber.toString(),
					runningHash: message.runningHash ? Buffer.from(message.runningHash).toString('hex') : '',
					contents: message.contents ? Buffer.from(message.contents).toString('utf8') : '',
					consensusTimestamp: message.consensusTimestamp.toDate().toISOString(),
					// chunkInfo removed for simplicity
				};

				messages.push(messageData);
				messageCount++;

				// If we've reached the limit, unsubscribe and resolve
				if (messageCount >= limit) {
					subscription.unsubscribe();
					resolve({
						topicId,
						messages,
						messageCount,
						limit,
						sequenceFrom: sequenceFrom || null,
					});
				}
			});

			// Set a timeout to prevent hanging indefinitely
			setTimeout(() => {
				subscription.unsubscribe();
				resolve({
					topicId,
					messages,
					messageCount,
					limit,
					sequenceFrom: sequenceFrom || null,
					note:
						messageCount < limit
							? 'Retrieved all available messages within timeout'
							: 'Limit reached',
				});
			}, 30000); // 30 second timeout

			// Handle subscription errors
			// subscription.on('error', (error: any) => {
			// 	subscription.unsubscribe();
			// 	reject(new Error(`Topic message subscription error: ${error.message}`));
			// });
		});
	}
}
