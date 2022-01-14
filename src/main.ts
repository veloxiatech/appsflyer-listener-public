import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { google } from 'googleapis';
import * as path from 'path';

(async () => {
  const auth = new google.auth.GoogleAuth({
    keyFilename: path.join(__dirname, 'space-colony-googleapis.json'),
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });

  const authClient = await auth.getClient();

  google.options({ auth: authClient });

  const app = await NestFactory.create(AppModule);
  await app.listen(8080);
})();
