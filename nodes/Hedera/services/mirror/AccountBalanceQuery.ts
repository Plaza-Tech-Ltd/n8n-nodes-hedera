import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';
import { Hbar, HbarUnit } from '@hashgraph/sdk';

export interface AccountBalanceResult {
	accountId: string;
	hbarBalance: string;
}

export class AccountBalanceQueryOperation extends BaseMirrorOperation<
	'/api/v1/accounts/{idOrAliasOrEvmAddress}',
	AccountBalanceResult
> {
	constructor() {
		super(
			(params: IDataObject) => `/api/v1/accounts/${String(params.accountId)}`,
			(
				data: PathResponse<'/api/v1/accounts/{idOrAliasOrEvmAddress}'>,
				params: IDataObject,
			): AccountBalanceResult => {
				const accountId = String(params.accountId);
				const hbarBalance = Hbar.fromTinybars(data.balance?.balance ?? 0)
					.to(HbarUnit.Hbar)
					.toString();

				return { accountId, hbarBalance };
			},
		);
	}
}
