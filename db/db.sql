CREATE DATABASE IF NOT EXISTS companydb;

CREATE TABLE IF NOT EXISTS employee (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    salary INT DEFAULT NULL,
    PRIMARY KEY(id)
);

DESCRIBE employee;

INSERT INTO employee VALUES
    (1, 'Joe', 1000),
    (2, 'Henry', 2000),
    (3, 'Sam', 2500),
    (4, 'Max', 1500);

SELECT * FROM employee;