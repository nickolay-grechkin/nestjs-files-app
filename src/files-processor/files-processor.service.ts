import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { FilesService } from 'src/files/files.service';

@Processor('filesQueue')
export class FilesProcessorService {
  private readonly logger = new Logger(FilesProcessorService.name);

  constructor(private readonly filesService: FilesService) {}

  @Process('uploadToDrive')
  async uploadToDrive(job: Job<{ fileUrls: string[] }>) {
    const { fileUrls } = job.data;
    const total = fileUrls.length;
    let completed = 0;
    const results = [];

    const uploadPromises = fileUrls.map(async (fileUrl) => {
      try {
        await this.filesService.uploadFile(fileUrl);
        results.push({ fileUrl, status: 'success' });
      } catch (error) {
        this.logger.error(`Failed to upload ${fileUrl}: ${error.message}`);
        results.push({ fileUrl, status: 'error', error: error.message });
      } finally {
        completed++;
        job.progress({ current: completed, total, results });
      }
    });

    await Promise.allSettled(uploadPromises);

    return { status: 'completed', results };
  }
}
