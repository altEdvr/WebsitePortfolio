const express = require('express');
const app = require('../netlify/functions/api');

module.exports = (req, res) => {
  app(req, res);
};
