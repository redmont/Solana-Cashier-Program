import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    webhookListener: 'src/handlers/webhookListener.ts',
    webhookListenerHelius: 'src/handlers/webhookListenerHelius.ts',
  },
});
