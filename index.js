
var querystring = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');

function parseActivity(body, entry) {
  var $ = cheerio.load(body);

  var timestamp;

  $('#bugzilla-body table tr').each((index, element) => {
    var td = $(element).children('td');

    if (td.is('[rowspan]')) {
      timestamp = new Date(td.eq(1).text());
    }

    td = td.not('[rowspan]');

    if (td.eq(0).text().trim() == 'Status') {
      switch (td.eq(2).text().trim()) {
        case 'RESOLVED':
          entry.solve = timestamp;
          break;
        case 'VERIFIED':
          entry.verify = timestamp;
          break;
        case 'CLOSED':
          entry.close = timestamp;
          break;
        case 'REOPENED':
          entry = { open: entry.open };
      }
    }
  });
}

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
      var $ = cheerio.load(body);

      var raw_data = {};

      $('bug').each((index, element) => {
        var id = $(element).children('bug_id').text();
        var open = $(element).children('creation_ts').text();

        raw_data[parseInt(id)] = { open: new Date(open) };
      });

      async.each(bug_list, (id, callback) => {
        request(site + '/show_activity.cgi?' + querystring.stringify({ id: id }), {
          headers: { Cookie: 'LANG=en' } // Ensure the language; English is easier to deal with.
        }, (error, response, body) => {
          parseActivity(body, raw_data[id]);
          callback();
        });
      }, (error) => {
        console.log(raw_data);
      });
    });
  });
}

main(process.argv[2], { product: process.argv[3], target_milestone: process.argv[4] });

