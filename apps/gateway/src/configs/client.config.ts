import { USER_PACKAGE_NAME } from "@app/common";
import { Global, Module } from "@nestjs/common";
import { ClientProviderOptions, ClientsModule, MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
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
]

@Global()
@Module({
  imports:[
    ClientsModule.register(clientConfig)
  ],
  exports:[ClientsModule]
})
export class ClientConfigModule {}