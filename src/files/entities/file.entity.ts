import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  driveFileId: string;

  @Column()
  name: string;

  @Column()
  webViewLink: string;

  @Column()
  webContentLink: string;
}
