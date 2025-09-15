import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export class AccountNFTsQueryOperation extends BaseMirrorOperation<
	'/api/v1/accounts/{idOrAliasOrEvmAddress}/nfts',
	PathResponse<'/api/v1/accounts/{idOrAliasOrEvmAddress}/nfts'>
> {
	constructor() {
		super((params: IDataObject) => `/api/v1/accounts/${String(params.accountId)}/nfts?limit=100`);
	}
}
