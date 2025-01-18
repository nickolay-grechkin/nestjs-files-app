import { IsArray, IsUrl } from 'class-validator';

export class UploadFilesDto {
  @IsArray()
  @IsUrl(
    {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
    },
    { each: true, message: 'Each URL must be a valid HTTP/HTTPS URL' },
  )
  fileUrls: string[];
}
