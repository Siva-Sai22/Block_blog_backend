const express = require('express');
const bodyParser = require('body-parser');
const blogRoutes = require('./routes/blog');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api',blogRoutes);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});