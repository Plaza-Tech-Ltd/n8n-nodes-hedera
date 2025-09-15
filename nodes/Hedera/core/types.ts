import { IDataObject, INodeProperties } from 'n8n-workflow';
import { Client } from '@hashgraph/sdk';

export interface IHederaCredentials {
	accountId: string;
	privateKey: string;
	network: 'mainnet' | 'testnet' | 'previewnet';
}

export type IOperationResult<T = IDataObject> = T;

export interface IBaseOperation<T = IDataObject> {
	execute(params: IDataObject, client: Client): Promise<IOperationResult<T>>;
}

export interface IHederaService {
	getProperties(): INodeProperties[];
	extractParameters(
		operation: string,
		getNodeParameter: Function,
		itemIndex: number,
		accountId: string,
	): IDataObject;
	execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult>;
}

export type NetworkType = 'mainnet' | 'testnet' | 'previewnet';
