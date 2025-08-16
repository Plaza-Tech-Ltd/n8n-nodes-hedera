// TokenBalanceQuery.ts
import { AccountBalanceQuery, Client, AccountId, TokenId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class TokenBalanceQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const accountId = params.accountId as string;
		const tokenId = params.tokenId as string;

		const query = new AccountBalanceQuery().setAccountId(AccountId.fromString(accountId));

		const balance = await query.execute(client);

		// Find the specific token balance
		const tokenIdObj = TokenId.fromString(tokenId);
		const tokenBalance = balance.tokens?.get(tokenIdObj);

		if (tokenBalance === undefined) {
			return {
				accountId: accountId,
				tokenId,
				balance: '0',
				hasToken: false,
				message: 'Account does not hold this token',
			};
		}

		return {
			accountId: accountId,
			tokenId,
			balance: tokenBalance?.toString() ?? '0',
			hasToken: true,
			hbarBalance: balance.hbars.toString(),
		};
	}
}
