// AccountTokensQuery.ts
import { AccountBalanceQuery, Client, AccountId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class AccountTokensQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const accountId = params.accountId as string;

		const query = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));

		const balance = await query.execute(client);

		// Extract token information from the balance query
		const tokens = balance.tokens
			? Array.from(balance.tokens!.keys()).map((tokenId) => ({
					tokenId: tokenId.toString(),
					balance: balance.tokens!.get(tokenId)?.toString() ?? '0',
					decimals: null, // Balance query doesn't provide decimals info
				}))
			: [];

		return {
			accountId: accountId,
			tokens,
			tokenCount: tokens.length,
			hbarBalance: balance.hbars.toString(),
		};
	}
}
