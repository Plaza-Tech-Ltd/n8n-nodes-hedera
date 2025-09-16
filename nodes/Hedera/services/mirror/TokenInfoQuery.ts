import { IDataObject } from 'n8n-workflow';
import { PathResponse } from '../../core/mirror-types';
import { BaseMirrorOperation } from './BaseMirrorOperation';

export class TokenInfoQueryOperation extends BaseMirrorOperation<
	'/api/v1/tokens/{tokenId}',
	PathResponse<'/api/v1/tokens/{tokenId}'>
> {
	constructor() {
		super((params: IDataObject) => `/api/v1/tokens/${String(params.tokenId)}`);
	}
}
