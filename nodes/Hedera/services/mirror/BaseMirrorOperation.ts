import axios from 'axios';
import { IDataObject } from 'n8n-workflow';
import { Client } from '@hashgraph/sdk';
import { IBaseOperation, IOperationResult } from '../../core/types';
import { PathKey, PathResponse } from '../../core/mirror-types';
import { getMirrorNodeUrl } from './utils';

export abstract class BaseMirrorOperation<P extends PathKey, Output = PathResponse<P>>
	implements IBaseOperation<Output>
{
	constructor(
		private readonly buildPath: (params: IDataObject) => string,
		private readonly transform?: (data: PathResponse<P>, params: IDataObject) => Output,
	) {}

	async execute(params: IDataObject, client?: Client): Promise<IOperationResult<Output>> {
		const mirrorNodeUrl = getMirrorNodeUrl(client);
		const url = `${mirrorNodeUrl}${this.buildPath(params)}`;
		const { data } = await axios.get<PathResponse<P>>(url);
		return this.transform ? this.transform(data, params) : (data as unknown as Output);
	}
}
