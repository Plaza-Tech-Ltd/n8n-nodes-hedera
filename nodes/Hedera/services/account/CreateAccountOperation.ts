import { AccountCreateTransaction, PrivateKey, Hbar, Client } from '@hashgraph/sdk';
import { IDataObject } from 'n8n-workflow';
import { IBaseOperation, IOperationResult } from '../../core/types';

export class CreateAccountOperation implements IBaseOperation {
	async execute(params: IDataObject, client: Client): Promise<IOperationResult> {
		const initialBalance = params.initialBalance as number;

		const newPrivateKey = PrivateKey.generateED25519();
		const newPublicKey = newPrivateKey.publicKey;

		const txId = await new AccountCreateTransaction()
			.setKey(newPublicKey)
			.setInitialBalance(new Hbar(initialBalance))
			.execute(client);

		const receipt = await txId.getReceipt(client);
		if (!receipt.accountId) {
			throw new Error(`Account creation failed: ${receipt.status.toString()}`);
		}

		return {
			newAccountId: receipt.accountId.toString(),
			newAccountPublicKey: newPublicKey.toString(),
			newAccountPrivateKey: newPrivateKey.toString(),
		};
	}
}