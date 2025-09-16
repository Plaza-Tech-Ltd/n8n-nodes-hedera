import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export class TokenBalanceQueryOperation extends BaseMirrorOperation<
	'/api/v1/tokens/{tokenId}/balances',
	PathResponse<'/api/v1/tokens/{tokenId}/balances'>
> {
	constructor() {
		super((params: IDataObject) => `/api/v1/tokens/${String(params.tokenId)}/balances?order=desc`);
	}
}
