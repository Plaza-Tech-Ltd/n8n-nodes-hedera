// AccountBalanceQuery.ts
import { AccountBalanceQuery, Client, AccountId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class AccountBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const accountId = params.accountId as string;

		const query = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));

		const balance = await query.execute(client);

		return {
			accountId: accountId,
			hbarBalance: balance.hbars.toString(),
			hbarBalanceTinybars: balance.hbars.toTinybars().toString(),
			tokens: balance.tokens
				? Array.from(balance.tokens!.keys()).reduce(
						(acc, tokenId) => {
							acc[tokenId.toString()] = balance.tokens!.get(tokenId)?.toString() ?? '0';
							return acc;
						},
						{} as Record<string, string>,
					)
				: {},
			tokenCount: balance.tokens ? balance.tokens.size : 0,
		};
	}
}
