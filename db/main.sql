DROP DATABASE IF EXISTS assaig;

CREATE DATABASE assaig;

USE assaig;

CREATE TABLE users(
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    pass VARCHAR(768) NOT NULL,
    usertype ENUM('admin','student','teacher'),
    sf TEXT,

    PRIMARY KEY (username)
);

CREATE TABLE tasks(
    _id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title TEXT NOT NULL,
    body TEXT,
    points DECIMAL(8, 2),

    PRIMARY KEY (_id)
);

CREATE TABLE task_examples(
    _id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    entrada TEXT,
    salida TEXT,
    public BOOLEAN,
    id_task INT UNSIGNED NOT NULL,

    PRIMARY KEY(_id, id_task)
);

CREATE TABLE available_langs(
    lang ENUM('nodejs', 'python3', 'java'),
    id_task INT UNSIGNED NOT NULL,

    PRIMARY KEY(lang, id_task)
);

CREATE TABLE history(
    _id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    stamp DATETIME NOT NULL,
    source_path VARCHAR(255) NOT NULL,
    time_used DECIMAL(8, 2),
    mem_used DECIMAL(8, 2),

    username VARCHAR(50),
    id_task INT UNSIGNED,

    PRIMARY KEY (_id)
);

ALTER TABLE task_examples ADD FOREIGN KEY (id_task) REFERENCES tasks(_id) ON DELETE CASCADE;
ALTER TABLE available_langs ADD FOREIGN KEY (id_task) REFERENCES tasks(_id) ON DELETE CASCADE;
ALTER TABLE history ADD FOREIGN KEY (username) REFERENCES users(username) ON DELETE SET NULL;
ALTER TABLE history ADD FOREIGN KEY (id_task) REFERENCES tasks(_id) ON DELETE SET NULL;
