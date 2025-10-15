import { LOCATION_PACKAGE_NAME, USER_PACKAGE_NAME } from "@app/common";

import { Global, Module } from "@nestjs/common";
import { ClientProviderOptions, ClientsModule, Transport } from "@nestjs/microservices";
import { config } from "dotenv";
import { join } from "path";
config({
  path: join(process.cwd(), '.env'),
})
const clientConfig: ClientProviderOptions[] = [
    {
        name: USER_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
            package: USER_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'protos/user.proto'),
            url: process.env.USER_GRPC_URI,
        },
    },
    {
        name: LOCATION_PACKAGE_NAME,
        transport: Transport.GRPC,
        options: {
            package: LOCATION_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'protos/location.proto'),
            url: process.env.LOCATION_GRPC_URI,
        },
    },
]

@Global()
@Module({
  imports:[
    ClientsModule.register(clientConfig)
  ],
  exports:[ClientsModule]
})
export class ClientConfigModule {}