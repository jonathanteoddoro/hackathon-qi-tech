import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS para o frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Configuração para uploads maiores (50MB)
  app.use('/api/afi/request', (req, res, next) => {
    req.setTimeout(300000); // 5 minutos timeout
    next();
  });
  
  await app.listen(process.env.PORT ?? 3001);
  console.log('🚀 Backend rodando na porta 3001');
  console.log('📁 Uploads aceitos até 50MB para AFI tokens');
}
bootstrap();
