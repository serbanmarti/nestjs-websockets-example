import { AppModule } from './app.module';
import { EventsGateway } from './events/events.gateway';
import { NestFactory } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  await app.listen(port);

  const eventsGateway = app.get(EventsGateway);
  setInterval(() => {
    eventsGateway.sendGlobalMessages();
  }, 5000);
}
bootstrap();
