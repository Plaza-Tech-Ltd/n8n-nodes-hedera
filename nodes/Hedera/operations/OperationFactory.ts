import { IHederaService } from '../core/types';
import { INodeProperties } from 'n8n-workflow';
import { AccountService } from '../services/account/AccountService';
import { TokenService } from '../services/token/TokenService';
import { MirrorService } from '../services/mirror/MirrorService';
import { ConsensusService } from '../services/consensus/ConsensusService';

export class OperationFactory {
	private static accountService = new AccountService();
	private static tokenService = new TokenService();
	private static mirrorService = new MirrorService();
	private static consensusService = new ConsensusService();

	static getService(resource: string): IHederaService {
		switch (resource) {
			case 'account':
				return this.accountService;
			case 'token':
				return this.tokenService;
			case 'mirror':
				return this.mirrorService;
			case 'consensus':
				return this.consensusService;
			default:
				throw new Error(`Unsupported resource: ${resource}`);
		}
	}

	static getAllProperties(): INodeProperties[] {
		return [
			...this.accountService.getProperties(),
			...this.tokenService.getProperties(),
			...this.mirrorService.getProperties(),
			...this.consensusService.getProperties(),
		];
	}
}
