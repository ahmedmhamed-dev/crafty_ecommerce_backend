import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: any): Promise<string> {
    const uploadPath = this.configService.get('UPLOAD_PATH') || './uploads';
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    fs.writeFileSync(path.join(uploadPath, filename), file.buffer);
    return `/uploads/${filename}`;
  }
}
