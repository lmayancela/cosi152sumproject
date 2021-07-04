const Twitter = require('twitter');
const auth = require('../config/auth.js');
const client = new Twitter({
  consumer_key: auth.twitterAuth.consumer_key,
  consumer_secret: auth.twitterAuth.consumer_secret,
  access_token_key: auth.twitterAuth.access_token_key,
  access_token_secret: auth.twitterAuth.access_token_secret
});

function sendTwit(reminder_data){
  console.log(auth.twitterAuth);
  var params = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: 'LisandroMayanc1',
        },
        message_data: {
          text: reminder_data.task,
        }
      }
    }
  };

  client.post('direct_messages/events/new', params, function(error, response) {
    if (!error) {
      console.log(response)
    } else {
      console.dir(error)
    }
  });
}

module.exports = sendTwit;
