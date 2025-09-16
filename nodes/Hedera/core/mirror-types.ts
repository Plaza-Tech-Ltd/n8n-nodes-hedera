import type { paths as pathsMainnet } from './mirror-node-mainnet';
import type { paths as pathsTestnet } from './mirror-node-testnet';
import type { paths as pathsPreviewnet } from './mirror-node-previewnet';

type paths = pathsMainnet & pathsTestnet & pathsPreviewnet;

type MethodOf<P extends keyof paths, M extends keyof paths[P]> = paths[P][M];
type ResponsesOf<T> = T extends { responses: infer R } ? R : never;
type ContentOf<T> = T extends { content: infer C } ? C : never;
type JsonOf<C> = C extends { 'application/json': infer J } ? J : never;
type OkResponse<R> = 200 extends keyof R ? R[200] : R[keyof R];

// Extract application/json response
export type PathResponse<P extends keyof paths, M extends keyof paths[P] = 'get'> = JsonOf<
	ContentOf<OkResponse<ResponsesOf<MethodOf<P, M>>>>
>;

export type PathKey = keyof paths;
