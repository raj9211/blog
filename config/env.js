'use strict';
require('dotenv').config();

module.exports = {
    uri: process.env.DATABASE_URI,
    secret: 'hacking this server will kill us',
    db: process.env.DATABASE_NAME
}