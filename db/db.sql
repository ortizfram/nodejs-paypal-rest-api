CREATE DATABASE IF NOT EXISTS companydb;

CREATE TABLE IF NOT EXISTS employee (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    salary INT DEFAULT NULL,
    PRIMARY KEY(id)
);

 CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        enrolled_courses INTEGER[]
      );


DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS user_courses;

CREATE TABLE IF NOT EXISTS courses (
    id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    ars_price DECIMAL(10, 2) NOT NULL,
    usd_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT NULL,
    active BOOLEAN DEFAULT true,
    thumbnail VARCHAR(255) DEFAULT NULL,
    length INT DEFAULT 0,
    PRIMARY KEY(id),
    UNIQUE KEY(slug)
);

ALTER TABLE courses MODIFY discount DECIMAL(10, 2) DEFAULT NULL;



DESCRIBE employee;

INSERT INTO employee VALUES
    (1, 'Joe', 1000),
    (2, 'Henry', 2000),
    (3, 'Sam', 2500),
    (4, 'Max', 1500);

SELECT * FROM employee;