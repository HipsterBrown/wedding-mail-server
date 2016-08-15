// native modules
var http = require('http');
var url = require('url');

// npm modules
var SparkPost = require('sparkpost');
var client = new SparkPost();

var port = process.env.PORT || 8080;

// server setup
var server = http.createServer((request, response) => {
  var path = url.parse(request.url, true).pathname;

  switch (path) {
    case '/':
      sendMail(request, response);
      break;
    default:
      returnNotFound(request, response);
      break;
  }
});

server.listen(port, (error) => {
  if (error) {
    console.log('An error starting the server.');
    throw new Error(error);
  } else {
    console.log(`The server has started on port ${port}.`);
  }
});

// route handlers
function sendMail(request, response) {
  var data = '';

  request.on('data', (chunk) => { data += chunk.toString() });

  request.on('end', () => {
    data = JSON.parse(data);

    client.transmissions.send({
      transmissionBody: {
        content: {
          from: data.from,
          subject: data.subject,
          html: `
          <html>
            <body>
              <h2>${data.sender}[${data.email}] has sent a message from the Better Toget-Hehr:</h2>
              <p>${data.message}</p>
            </body>
          </html>
          `
        },
        recipients: [
          {address: 'leah2010@gmail.com'}
        ]
      }
    }, (error, mailResponse) => {
      if (error) {
        returnServerError(response, error);
      } else {
        response.writeHead(200, {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
        });
        response.end(JSON.stringify({
          "message": 'Mailer successful!',
          "response": mailResponse
        }));
      }
    });
  });
}

function returnServerError(response, error) {
  response.writeHead(500, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  response.end(JSON.stringify({
    "error": error,
    "message": 'Sorry, something went wrong here.'
  }));
}

function returnNotFound(request, response) {
  response.writeHead(404, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  });
  response.end(JSON.stringify({
    "message": 'Route not found. Please check your request and try again.'
  }));
}
