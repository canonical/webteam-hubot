const requiredEnvs = (envs) =>
  Object.keys(envs)
    .filter((envName) => !envs[envName])
    .forEach((envName) => console.warn(`Missing ${envName} in environment`));

module.exports = { requiredEnvs };
