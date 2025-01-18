import { forwardRef, Module } from '@nestjs/common';
import { FilesProcessorService } from './files-processor.service';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [forwardRef(() => FilesModule)],
  providers: [FilesProcessorService],
})
export class FilesProcessorModule {}
