import { IHederaService } from '../core/types';
import { INodeProperties } from 'n8n-workflow';
import { AccountService } from '../services/account/AccountService';
import { TokenService } from '../services/token/TokenService';
import { MirrorService } from '../services/mirror/MirrorService';

export class OperationFactory {
	private static accountService = new AccountService();
	private static tokenService = new TokenService();
	private static mirrorService = new MirrorService();

	static getService(resource: string): IHederaService {
		switch (resource) {
			case 'account':
				return this.accountService;
			case 'token':
				return this.tokenService;
			case 'mirror':
				return this.mirrorService;
			default:
				throw new Error(`Unsupported resource: ${resource}`);
		}
	}

	static getAllProperties(): INodeProperties[] {
		return [
			...this.accountService.getProperties(),
			...this.tokenService.getProperties(),
			...this.mirrorService.getProperties(),
		];
	}
}
