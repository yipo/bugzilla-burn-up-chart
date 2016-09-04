
var request = require('request');

function main(site) {
  request(site, (error, response, body) => {
    console.log(body);
  });
}

main(process.argv[2]);

