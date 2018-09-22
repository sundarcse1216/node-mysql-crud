var express = require('express')
var app = express()
const log4js = require('log4js')

const LOGGER = log4js.getLogger(__filename);

var title = 'Users'

// SHOW ALL USERS LIST
app.get('/', function (req, res, next) {
    title = 'User List';
    req.getConnection(function (err, connection) {
        connection.query('SELECT * FROM users ORDER BY id DESC', function (err, rows, fields) {
            if (!err) {
                if (rows.length == 0) {
                    res.render('user/list', { code: 204, message: { status: 'No data', title: title, data: '' } })
                } else {
                    res.render('user/list', { code: 200, message: { status: 'success', title: title, data: rows } })
                }
            } else {
                LOGGER.error('Error while get all users : ' + err)
                req.flash("error", err);
                res.render('user/list', { code: 500, message: { status: 'Error while list data.', title: title, data: '' } })
            }
        })
    })

})

// SHOW ADD USER FORM
app.get('/add', function (req, res, next) {
    // render to views/user/add.ejs
    res.render('user/add', {
        message: {
            title: 'Add New User',
            data: {
                name: '',
                age: '',
                email: ''
            }
        }
    })
})

app.get('/info/(:id)', function (req, res, next) {
    let userID = req.params.id;
    title = 'User ' + userID
    req.getConnection(function (error, connection) {
        connection.query('SELECT * FROM users WHERE id=' + userID, function (err, rows, fields) {
            if (!err) {
                if (rows.length == 0) {
                    req.flash("success", 'No data available');
                    res.render('user/info', { code: 204, message: { status: 'No data', title: title, data: '' } })
                } else {
                    res.render('user/info', { code: 200, message: { status: 'success', title: title, data: rows } })
                }
            } else {
                LOGGER.error('Error while get user info : ' + err)
                req.flash("error", err);
                res.render('user/detail', { code: 500, message: { status: 'Error while get specifig user data.', title: title, data: '' } })
            }
        })
    })

});

// ADD NEW USER POST ACTION
app.post('/add', function (req, res, next) {
    title = 'Add New User'
    req.assert('name', 'Name is required').notEmpty() //Validate name
    req.assert('age', 'Age is required').notEmpty() //Validate age
    req.assert('email', 'A valid email is required').isEmail() //Validate email
    let errors = req.validationErrors();

    if (!errors) {
        /********************************************
         * Express-validator module
         
        req.body.comment = 'a <span>comment</span>';
        req.body.username = '   a user    ';
 
        req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
        req.sanitize('username').trim(); // returns 'a user'
        ********************************************/
        var user = {
            name: req.sanitize('name').escape().trim(),
            age: req.sanitize('age').escape().trim(),
            email: req.sanitize('email').escape().trim()
        }

        req.getConnection(function (error, connection) {
            connection.query('INSERT INTO users SET ?', user, function (err, result) {
                if (!err) {
                    req.flash('success', 'Data added successfully!')
                    res.render('user/add', {
                        code: 201,
                        message: {
                            status: 'Created successfuly.',
                            title: title,
                            data: {
                                name: '',
                                age: '',
                                email: ''
                            }
                        }
                    })
                } else {
                    LOGGER.error('Error while add user : ' + err)
                    req.flash('error', err)
                    res.render('user/add', {
                        code: 500,
                        message: {
                            status: 'Error while insert user',
                            title: title,
                            data: {
                                name: user.name,
                                age: user.age,
                                email: user.email
                            }
                        }
                    })
                }
            })
        })
    } else {
        let error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '</br>'
        })
        LOGGER.error('Validation error : ' + error_msg)
        req.flash('error', error_msg)
        res.render('user/add', {
            code: 500,
            message: {
                status: error_msg,
                title: title,
                data: {
                    name: user.name,
                    age: user.age,
                    email: user.email
                }
            }
        })
    }
})

// SHOW EDIT USER FORM
app.get('/edit/(:id)', function (req, res, next) {
    let userID = req.params.id;
    req.getConnection(function (error, connection) {
        connection.query('SELECT * FROM users WHERE id = ' + userID, function (err, rows, fields) {
            if (err) {
                LOGGER.error('Error while show edit form : ' + err)
                req.flash('error', err)
                res.redirect('/users', { code: 500, status: 'error while get user' })
            } else {
                if (rows.length <= 0) {
                    req.flash('error', 'User not found with id = ' + userID)
                    res.redirect('/users')
                } else {
                    res.render('user/edit', {
                        code: 200,
                        message: {
                            status: 'Edit page',
                            title: 'Edit User',
                            data: {
                                id: rows[0].id,
                                name: rows[0].name,
                                age: rows[0].age,
                                email: rows[0].email
                            }
                        }
                    })
                }
            }
        })
    })
})

// EDIT USER POST ACTION
app.put('/edit/(:id)', function (req, res, next) {
    title = 'Edit User';
    let userID = req.params.id;
    req.assert('name', 'Name is required').notEmpty()           //Validate name
    req.assert('age', 'Age is required').notEmpty()             //Validate age
    req.assert('email', 'A valid email is required').isEmail()  //Validate email

    var errors = req.validationErrors()
    if (!errors) {
        var user = {
            name: req.sanitize('name').escape().trim(),
            age: req.sanitize('age').escape().trim(),
            email: req.sanitize('email').escape().trim()
        }

        req.getConnection(function (error, connection) {
            connection.query('UPDATE users SET ? WHERE id = ' + userID, user, function (err, result) {
                if (!err) {
                    req.flash('success', 'Data updated successfully!')
                    // res.render('user/edit', {
                    //     code: 200,
                    //     message: {
                    //         status: 'updated successfully.',
                    //         title: 'Edit User',
                    //         data: {
                    //             id: req.params.id,
                    //             name: req.body.name,
                    //             age: req.body.age,
                    //             email: req.body.email
                    //         }
                    //     }
                    // })
                    res.redirect('/users')
                } else {
                    LOGGER.error('Error while update user : ' + err)
                    req.flash('error', err)
                    res.render('user/edit', {
                        code: 500,
                        message: {
                            status: 'Fail to updated',
                            title: title,
                            data: {
                                id: req.params.id,
                                name: req.body.name,
                                age: req.body.age,
                                email: req.body.email
                            }
                        }
                    })
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error_msg + '</br>'
        })
        LOGGER.error('Update validation error : ' + error_msg)
        req.flash('error', error_msg)
        res.render('user/edit', {
            code: 500,
            message: {
                status: 'Fail to updated',
                title: title,
                data: {
                    id: req.params.id,
                    name: req.body.name,
                    age: req.body.age,
                    email: req.body.email
                }
            }
        })
    }
})

// DELETE USER
app.delete('/delete/(:id)', function (req, res, next) {
    let userID = req.params.id;
    let user = { id: userID }
    req.getConnection(function (error, connection) {
        connection.query('DELETE FROM users WHERE id=' + userID, user, function (err, result) {
            if (!err) {
                req.flash('success', 'User deleted successfully! id = ' + userID)
                // res.redirect('/users', { code: 200, message: { status: 'deleted succefully', title: 'User List' } })
                res.redirect('/users')
            } else {
                LOGGER.error('Error while delete user : ' + err)
                req.flash('error', err)
                res.redirect('/users')
            }
        })
    })
})

module.exports = app