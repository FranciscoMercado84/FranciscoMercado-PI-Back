import dotenv from 'dotenv';
import { spawnSync } from 'child_process';

dotenv.config();

const token = process.env.SONAR_TOKEN;

if (!token) {
  console.error('SONAR_TOKEN no está definido en el entorno ni en .env');
  process.exit(1);
}

const result = spawnSync('npx', ['sonar-scanner'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SONAR_TOKEN: token
  },
  shell: true
});

process.exit(result.status ?? 1);
