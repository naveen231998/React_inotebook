const connectToMongo = require('./db');
const express = require('express');
const port = 5000

connectToMongo();

const app = express();

app.use(express.json())

app.use('/api/auth',require('./routes/auth'))
app.use('/api/notes',require('./routes/notes'))

// Start the server on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
