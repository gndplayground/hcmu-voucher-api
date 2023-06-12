import * as AWS from 'aws-sdk';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '@/common/config';

@Injectable()
export class UploadService {
  private s3: AWS.S3;
  constructor(private configService: ConfigService<AppConfig>) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('aws').accessKeyID,
      secretAccessKey: this.configService.get('aws').secretAccessKey,
    });
  }

  async upload(options: {
    path?: string;
    fileName: string;
    body: any;
    type?: string;
  }) {
    await this.s3
      .upload({
        Bucket: this.configService.get('aws').s3BucketName,
        Key: options.path
          ? `${options.path}/${options.fileName}`
          : options.fileName,
        Body: options.body,
        ContentType: options.type,
      })
      .promise();
  }

  async delete(options: { path?: string; fileName: string }) {
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('aws').s3BucketName,
        Key: options.path
          ? `${options.path}/${options.fileName}`
          : options.fileName,
      })
      .promise();
  }
}
