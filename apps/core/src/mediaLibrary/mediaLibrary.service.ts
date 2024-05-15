import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import * as fs from 'fs';
import * as fsPath from 'path';
import sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MediaLibraryService {
  private readonly bucketName: string;
  private readonly s3Client: S3Client;

  constructor(
    configService: ConfigService,
    @InjectModel('media') private readonly media: any,
  ) {
    this.bucketName = configService.get('mediaLibraryBucketName');
    if (this.bucketName) {
      this.s3Client = new S3Client({});
    }
  }

  private async writeFile(filePath: string, contents: Buffer) {
    if (this.bucketName) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: filePath,
          Body: contents,
        }),
      );
    } else {
      // Ensure folder path exists
      fs.mkdirSync(fsPath.dirname(filePath), { recursive: true });

      // Write file
      fs.writeFileSync(filePath, contents);
    }
  }

  private async generateThumbnail(
    contents: Buffer,
    filePath: string,
    mimeType: string,
  ) {
    if (mimeType.startsWith('image')) {
      // Generate thumbnail
      const resizedContents = await sharp(contents).resize(128, 128).toBuffer();
      await this.writeFile(
        filePath.replace(/(\.[\w\d_-]+)$/i, '_thumb$1'),
        resizedContents,
      );
    }
  }

  async getFiles(path: string | null) {
    if (!path) {
      path = '_ROOT_';
    }

    const files = await this.media
      .query({
        pk: `media#${path}`,
      })
      .exec();

    return files.map((file) => ({
      ...file,
      thumbnailFileName: file.mimeType.startsWith('image')
        ? file.sk.replace(/(\.[\w\d_-]+)$/i, '_thumb$1')
        : null,
    }));
  }

  async createFolder(name: string, path: string | null) {
    if (!path) {
      path = '_ROOT_';
    }

    await this.media.create({
      pk: `media#${path}`,
      sk: name,
      mimeType: '_FOLDER_',
    });
  }

  async uploadFile(file: Express.Multer.File, path: string | null) {
    if (!path) {
      path = '_ROOT_';
    }

    let existingFile;
    let name = file.originalname;
    let counter = 1;

    // Check if file already exists in database
    do {
      existingFile = await this.media.get({
        pk: `media#${path}`,
        sk: name,
      });

      // If it does, append -1 to the file name
      if (existingFile) {
        const [fileName, fileExtension] = file.originalname.split('.');
        name = `${fileName}-${counter}.${fileExtension}`;
        counter++;
      }
    } while (existingFile);

    let filePath: string;
    if (!this.bucketName) {
      filePath =
        path !== '_ROOT_'
          ? fsPath.join(__dirname, '../', 'media', path, name)
          : fsPath.join(__dirname, '../', 'media', name);
    } else {
      filePath = path === '_ROOT_' ? name : `${path}/${name}`;
    }

    await this.writeFile(filePath, file.buffer);

    await this.media.create({
      pk: `media#${path}`,
      sk: name,
      mimeType: file.mimetype,
    });

    await this.generateThumbnail(file.buffer, filePath, file.mimetype);
  }
}
