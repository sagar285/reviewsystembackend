
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRoutes from './routes/api';
import connectDB from './config/db';
import cluster from 'cluster';
import os from 'os';

const numCPUs = os.cpus().length;
const PORT = 3001;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking for ${numCPUs} CPUs`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // Optional: Replace dead worker
    cluster.fork();
  });

} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  connectDB();

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.use('/api', apiRoutes);

  app.listen(PORT, () => {
    console.log(`Worker ${process.pid} started and listening on http://localhost:${PORT}`);
  });
}
