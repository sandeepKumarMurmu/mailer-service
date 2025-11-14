import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  // Ensure upload directory exists
  ensureUploadPath(uploadPath: string): void {
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
  }

  // Multer storage configuration
  getStorage() {
    return diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = join(process.cwd(), 'uploads');
        this.ensureUploadPath(uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const fileExt = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${fileExt}`);
      },
    });
  }

  // Response for single file upload
  formatSingleFileResponse(file: Express.Multer.File) {
    const relativePath = `/uploads/${file.filename}`;
    const absolutePath = resolve(process.cwd(), 'uploads', file.filename);

    return {
      success: true,
      message: 'File uploaded successfully',
      relativePath, // accessible via API
      absolutePath, // full path on disk
    };
  }

  // Response for multiple files
  formatMultipleFilesResponse(files: Express.Multer.File[]) {
    const filePaths = files.map((file) => ({
      relativePath: `/uploads/${file.filename}`,
      absolutePath: resolve(process.cwd(), 'uploads', file.filename),
    }));

    return {
      success: true,
      message: `${files.length} files uploaded successfully`,
      files: filePaths,
    };
  }
}
