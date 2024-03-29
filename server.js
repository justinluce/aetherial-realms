//! This was originally for adding unity into the game, however I don't need this anymore
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const port = 8080;

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Serve gzipped files when requested without the .gz extension
// app.get('/Build/*', (req, res, next) => {
//   console.log(req.path);
//   const gzippedPath = path.join(__dirname, 'public', `${req.path}.gz`);

//   console.log("hey");

//   if (fs.existsSync(gzippedPath)) {
//       res.set('Content-Encoding', 'gzip');
      
//     // Set Content-Type based on file extension
//     let contentType = 'application/octet-stream';
//     if (req.path.endsWith('.js')) {
//       contentType = 'text/javascript';
//     } else if (req.path.endsWith('.wasm')) {
//       contentType = 'application/wasm';
//     } else if (req.path.endsWith('.data')) {
//       contentType = 'application/octet-stream';
//     }

//     res.set('Content-Type', contentType);
//     res.sendFile(gzippedPath);
//   } else {
//     next();
//   }
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
