when creating new service or operation for service e.g. consensus service and create topic:

1. if new service, add service in properties.options array @Hedera.node.ts
2. create services/XxxService.ts which implements IHederaService... see existing examples
3. create base operations and create / extend the properties in its service
4. add new service in operation factory
5. add it to static get all props method

Keep the services SIMPLE and minimal... essentially cover the minimum set of common
params that are needed for the tx to work... remember, the people using n8n will
not be super technical and likely results driven
