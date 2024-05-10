import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-dynamoose';
import * as fs from 'fs';
import * as fsPath from 'path';
import sharp from 'sharp';

@Injectable()
export class MediaLibraryService {
  constructor(@InjectModel('media') private readonly media: any) {}

  private async generateThumbnail(filePath: string, mimeType: string) {
    if (mimeType.startsWith('image')) {
      // Generate thumbnail
      await sharp(filePath)
        .resize(128, 128)
        .toFile(filePath.replace(/(\.[\w\d_-]+)$/i, '_thumb$1'));
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

    const filePath =
      path !== '_ROOT_'
        ? fsPath.join(__dirname, '../', 'media', path, name)
        : fsPath.join(__dirname, '../', 'media', name);

    // Ensure folder path exists
    fs.mkdirSync(fsPath.dirname(filePath), { recursive: true });

    fs.writeFileSync(filePath, file.buffer);

    await this.media.create({
      pk: `media#${path}`,
      sk: name,
      mimeType: file.mimetype,
    });

    await this.generateThumbnail(filePath, file.mimetype);
  }
}
