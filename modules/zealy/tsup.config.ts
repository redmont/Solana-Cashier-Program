import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    webhookListener: 'src/handlers/webhookListener.ts',
  },
});
