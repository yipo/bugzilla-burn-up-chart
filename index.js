
var querystring = require('querystring');
var request = require('request');
var cheerio = require('cheerio');

function main(site, query) {
  request(site + '/buglist.cgi?' + querystring.stringify(query), (error, response, body) => {
    var $ = cheerio.load(body);

    var bug_list = $('.bz_id_column').map((index, element) => {
      return parseInt($(element).children('a').text());
    }).get();

    request.post(site + '/show_bug.cgi', {
      body: querystring.stringify({ // It seems that the 'form' option of request package does not support multiple selections.
        ctype: 'xml',
        id: bug_list
      })
    }, (error, response, body) => {
      console.log(body);
    });
  });
}

main(process.argv[2], { product: process.argv[3], target_milestone: process.argv[4] });

