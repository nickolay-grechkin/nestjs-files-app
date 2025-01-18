import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';

@Injectable()
export class GoogleDriveService {
  private driveClient: drive_v3.Drive;

  constructor(private readonly configService: ConfigService) {
    this.initializeClient();
  }

  private async initializeClient() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: this.configService.get('CLIENT_EMAIL'),
        private_key: this.configService.get('PRIVATE_KEY'),
      },
      scopes: [this.configService.get('GOOGLE_DRIVE_API_SCOPE')],
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  async uploadFileFromStream(
    fileName: string,
    fileStream: any,
  ): Promise<drive_v3.Schema$File | undefined> {
    const fileMetadata = {
      name: fileName,
      parents: [this.configService.get('GOOGLE_DRIVE_FOLDER_ID')],
    };

    const response = await this.driveClient.files.create({
      requestBody: fileMetadata,
      media: {
        body: fileStream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    return response.data;
  }
}
