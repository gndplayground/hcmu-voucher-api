export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
});

export interface AppConfig {
  port: number;
  jwt: {
    secret: string;
    expiresIn: string;
  };
}
