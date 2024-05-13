import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaLibraryService } from './mediaLibrary.service';

interface CreateFolderRequest {
  name: string;
  path: string;
}

@Controller('admin/media-library')
export class MediaLibraryController {
  constructor(private readonly service: MediaLibraryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() { path }: { path: string | null },
  ) {
    await this.service.uploadFile(file, path);

    return {};
  }

  @Get('files')
  async getFiles(@Query('path') path?: string) {
    const files = await this.service.getFiles(path);

    return files.map(({ sk, mimeType, thumbnailFileName }) => ({
      name: sk,
      mimeType,
      thumbnailFileName,
    }));
  }

  @Post('folder')
  async createFolder(@Body() { name, path }: CreateFolderRequest) {
    await this.service.createFolder(name, path);

    return {};
  }
}
