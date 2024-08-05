const REQUIRED_ENV_VARS = [
  "BOT_TOKEN",
  "OCTO_KEY",
  "MONGO_URI",
  "MESSAGE"
] as const;

const checkEnv = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
};

type EnvVars = {
  [K in (typeof REQUIRED_ENV_VARS)[number]]: string;
};

export const env: EnvVars = REQUIRED_ENV_VARS.reduce((acc, name) => {
  acc[name] = checkEnv(name);
  return acc;
}, {} as EnvVars);
