import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleDriveModule } from 'src/google-drive/google-drive.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { FilesProcessorModule } from 'src/files-processor/files-processor.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: parseInt(configService.get('REDIS_PORT'), 10),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'filesQueue' }),
    TypeOrmModule.forFeature([File]),
    DatabaseModule,
    GoogleDriveModule,
    HttpModule,
    FilesProcessorModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
