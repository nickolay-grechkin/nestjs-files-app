import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleDriveService } from 'src/google-drive/google-drive.service';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectQueue('filesQueue')
    private readonly filesQueue: Queue,
    private readonly googleDriveService: GoogleDriveService,
    private readonly httpService: HttpService,
  ) {}

  async enqueueFileUploadJob(fileUrls: string[]) {
    try {
      const job = await this.filesQueue.add('uploadToDrive', {
        fileUrls,
      });

      return { jobId: job.id, message: 'Files uploading put in queue' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getJobProgress(jobId: string) {
    const job = await this.filesQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException(`Job with id ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = job.progress();

    return { state, progress };
  }

  async downloadFile(url: string) {
    try {
      const response: AxiosResponse = await this.httpService.axiosRef({
        method: 'GET',
        url: url,
        responseType: 'stream',
      });

      if (response.status !== 200) {
        throw new Error(`Failed to download file. Status: ${response.status}`);
      }

      return {
        stream: response.data,
        type: this.getFileTypeFromHeader(response.headers['content-type']),
      };
    } catch (error) {
      this.logger.error(`Failed to download file: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(fileUrl: string) {
    const { stream, type } = await this.downloadFile(fileUrl);

    try {
      const fileName = `${Date.now()}${type}`;

      const file = await this.googleDriveService.uploadFileFromStream(
        fileName,
        stream,
      );

      const newFile = this.fileRepository.create({
        driveFileId: file.id,
        name: file.name,
        webViewLink: file.webViewLink,
        webContentLink: file.webContentLink,
      });

      await this.fileRepository.save(newFile);

      return newFile;
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async getAllFiles() {
    return this.fileRepository.find();
  }

  async getFileByDriveId(driveFileId: string) {
    const file = await this.fileRepository.findOne({ where: { driveFileId } });

    if (!file) {
      this.logger.error(`File not found: ${driveFileId}`);

      throw new NotFoundException(
        `File with driveFileId ${driveFileId} not found`,
      );
    }

    return file;
  }

  getFileTypeFromHeader(contentType: string) {
    const mimeToExt = {
      'application/json': '.json',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
    };

    return mimeToExt[contentType] || '.bin';
  }
}
