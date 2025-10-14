import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmDbConfig implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            username:process.env.POSTGRES_USERNAME,
            password:process.env.POSTGRES_PASSWORD,
            database:process.env.POSTGRES_DATABASE,
            port:Number(process.env.POSTGRES_PORT) || 5432,
            host:process.env.POSTGRES_HOST,
            ssl:process.env.NODE_ENV === 'production' ? true : false,
            autoLoadEntities:true,
            synchronize:process.env.NODE_ENV === 'development' ? true : false,
        };
    }
}   