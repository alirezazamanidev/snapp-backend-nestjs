import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export const swaggerConfig = (app: INestApplication) => {
    const theme = new SwaggerTheme();

    const config = new DocumentBuilder()
        .setTitle('snapp Gateway API')
        .setDescription('snapp Gateway API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    
    const options = {
        explorer: true,
        customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK)
    };
    
    SwaggerModule.setup('swagger', app, document, options);
}