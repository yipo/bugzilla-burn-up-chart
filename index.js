
var querystring = require('querystring');
var request = require('request');

function main(site, query) {
  request(site + '/buglist.cgi?' + querystring.stringify(query), (error, response, body) => {
    console.log(body);
  });
}

main(process.argv[2], { product: process.argv[3], target_milestone: process.argv[4] });

