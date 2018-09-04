# NodeJS & MySql CRUD

CRUD application using Node.js, Express, MySQL & EJS Templating Engine.

Prerequisites
=============
Install MySql and start the srvice.
Creata the database and table.

CREATE DATABASE node;

use node;

CREATE TABLE users (
id int(11) NOT NULL auto_increment,
name varchar(100) NOT NULL,
age int(3) NOT NULL,
email varchar(100) NOT NULL,
PRIMARY KEY (id)
);

Author
======
 * Sundararajan S ( <a href='https://plus.google.com/u/0/111539773439809637731'>Google+</a> )
