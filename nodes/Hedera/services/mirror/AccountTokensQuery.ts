import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export class AccountTokensQueryOperation extends BaseMirrorOperation<
	'/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens',
	PathResponse<'/api/v1/accounts/{idOrAliasOrEvmAddress}/tokens'>
> {
	constructor() {
		super((params: IDataObject) => `/api/v1/accounts/${String(params.accountId)}/tokens?limit=100`);
	}
}
