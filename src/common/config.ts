export default () =>
  ({
    port: parseInt(process.env.PORT, 10) || 3000,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    aws: {
      accessKeyID: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      s3BucketName: process.env.AWS_S3_BUCKET_NAME,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
    },
    email: {
      from: process.env.EMAIL_FROM,
    },
  } as AppConfig);

export interface AppConfig {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  aws: {
    accessKeyID: string;
    secretAccessKey: string;
    s3BucketName?: string;
  };
  sendgrid: {
    apiKey: string;
  };
  email: {
    from: string;
  };
}
