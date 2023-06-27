import express from 'express';

const app = express();
const port = process.env.PORT || '3000';

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  return console.log(`Ride-sharing service listening at http://localhost:${port}`);
});
