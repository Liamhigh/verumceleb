import { app } from './index.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Functions API listening on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET  /v1/verify');
  console.log('  POST /v1/contradict');
  console.log('  POST /v1/anchor');
  console.log('  POST /v1/seal');
  console.log('  POST /v1/assistant');
  console.log('  GET  /v1/notice');
});
