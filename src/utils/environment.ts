export enum Environment {
  Development = 'development',
  Production = 'production',
}

export const getEnvironment = (): Environment => {
  switch (process.env.NODE_ENV) {
    case 'dev':
      return Environment.Development;
    case 'prod':
      return Environment.Production;
    default:
      return Environment.Development;
  }
};

export const getEnvFilePaths = () => {
  const environment = getEnvironment();
  return [`.env.${environment}.local`, `.env.${environment}`, '.env'];
};
