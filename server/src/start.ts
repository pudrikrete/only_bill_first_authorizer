import app from '@server';

// Start the server
const port = Number(process.env.PORT || 3031);

//var fs = require('fs');
//var https = require('https');
//var privateKey  = fs.readFileSync('src/certs/private.key', 'utf8');
//var certificate = fs.readFileSync('src/certs/certificate.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};

//var httpsServer = https.createServer(credentials, app);
//httpsServer.listen(port, () => {
//	console.log('HTTPS express server started on port: ' + port);
//});

app.listen(port, () => {
   console.log('Express server started on port: ' + port);
});
