var express = require('express')
var app = express()

app.get('/', function (req, res) {
    // render to views/index.ejs template file
    res.render('index', { message: { title: 'Node.js CRUD Application', test: 'test' } })
})

module.exports = app;