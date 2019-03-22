
const jwt = require('express-jwt');



const auth = {
  required: jwt({
    secret: 'tT6YAJB70cMBDRrlPvgl8W2I+DFA06ULjrZnpob9y5M=',
  }),
  optional: jwt({
    secret: 'tT6YAJB70cMBDRrlPvgl8W2I+DFA06ULjrZnpob9y5M=',
    credentialsRequired: false,
  }),
};

module.exports = auth;