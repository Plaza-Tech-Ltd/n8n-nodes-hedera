import { Client } from '@hashgraph/sdk';
import { IDataObject, INodeProperties } from 'n8n-workflow';
import { IHederaService, IOperationResult } from '../../core/types';
import { CreateAccountOperation } from './CreateAccountOperation';

export class AccountService implements IHederaService {
	private createAccountOperation = new CreateAccountOperation();

	getProperties(): INodeProperties[] {
		return [
			{
				displayName: 'Operation',
				name: 'accountOperation',
				type: 'options',
				displayOptions: {
					show: { resource: ['account'] },
				},
				options: [
					{ name: 'Create Account', value: 'create', description: 'Create a new Hedera account' },
				],
				default: 'create',
			},
			{
				displayName: 'Initial Balance (HBAR)',
				name: 'initialBalance',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['account'],
						accountOperation: ['create'],
					},
				},
				default: 0,
				description: 'Initial HBAR funding for the new account',
			},
		];
	}

	extractParameters(
		operation: string,
		getNodeParameter: Function,
		itemIndex: number,
		accountId?: string,
	): IDataObject {
		const params: IDataObject = {};

		switch (operation) {
			case 'create':
				params.initialBalance = getNodeParameter('initialBalance', itemIndex);
				break;
			default:
				throw new Error(`Unsupported account operation: ${operation}`);
		}

		return params;
	}

	async execute(operation: string, params: IDataObject, client: Client): Promise<IOperationResult> {
		switch (operation) {
			case 'create':
				return this.createAccountOperation.execute(params, client);
			default:
				throw new Error(`Unsupported account operation: ${operation}`);
		}
	}
}
