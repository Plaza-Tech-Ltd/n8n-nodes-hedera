import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export class AccountInfoQueryOperation extends BaseMirrorOperation<
	'/api/v1/accounts/{idOrAliasOrEvmAddress}',
	PathResponse<'/api/v1/accounts/{idOrAliasOrEvmAddress}'>
> {
	constructor() {
		super((params: IDataObject) => `/api/v1/accounts/${String(params.accountId)}`);
	}
}
