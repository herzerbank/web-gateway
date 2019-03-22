var Flightplan = require('flightplan');
console.log(Flightplan);

var appName = 'herzerbank-app';
var username = 'pwd';
var startFile = 'bin/www';

var tmpDir = appName + '--' + new Date().getTime();

var plan = Flightplan;

plan.briefing({
  debug: false,
  destinations:{ 
    'staging': {
      host: '91.114.165.105',
      username: 'pwd',
      agent: process.env.SSH_AUTH_SOCK
    },
  }
});
