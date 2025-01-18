import { ConfigModule } from '@nestjs/config';
import { GoogleDriveService } from './google-drive.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [ConfigModule],
  providers: [GoogleDriveService],
  exports: [GoogleDriveService],
})
export class GoogleDriveModule {}
