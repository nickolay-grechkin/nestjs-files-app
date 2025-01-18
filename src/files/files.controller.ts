import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFilesDto } from './dtos/upload-files.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  async uploadFile(@Body() data: UploadFilesDto) {
    return this.filesService.enqueueFileUploadJob(data.fileUrls);
  }

  @Get('progress/:jobId')
  async getJobProgress(@Param('jobId') jobId: string) {
    return this.filesService.getJobProgress(jobId);
  }

  @Get()
  async getAllFiles() {
    return this.filesService.getAllFiles();
  }

  @Get(':driveFileId')
  async getFileById(@Param('driveFileId') driveFileId: string) {
    return this.filesService.getFileByDriveId(driveFileId);
  }
}
