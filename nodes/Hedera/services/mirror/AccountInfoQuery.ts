import { AccountInfoQuery, Client, AccountId } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class AccountInfoQueryOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const accountId = params.accountId as string;

		const query = new AccountInfoQuery()
			.setAccountId(AccountId.fromString(accountId));

		const accountInfo = await query.execute(client);

		return {
			accountId: accountInfo.accountId.toString(),
			balance: accountInfo.balance.toString(),
			key: accountInfo.key?.toString() || '',
			autoRenewPeriod: accountInfo.autoRenewPeriod?.seconds?.toString() || '',
			memo: accountInfo.accountMemo || '',
			deleted: accountInfo.isDeleted,
			expirationTime: accountInfo.expirationTime?.toDate()?.toISOString() || '',
			receiverSigRequired: accountInfo.isReceiverSignatureRequired,
			contractAccountId: accountInfo.contractAccountId?.toString() || '',
		};
	}
}