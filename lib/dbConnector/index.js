import mysql from "mysql2/promise";

/**
 * @typedef {Object} Task
 * @property {Number} id id interna
 * @property {string} title títol del problema
 * @property {string} body enunciat del problema
 * @property {Number} points puntuació del problema (0.00-10.00)
 * @property {Array<TaskExample>} examples 
 * @property {Array<"nodejs"|"python3"|"java">} langs llenguatges admesos
 */

/**
 * @typedef {Object} TaskExample
 * @property {string} entrada entrada del programa
 * @property {string} salida sortida del programa
 * @property {boolean} public si l'exemple pertany al set de proves public
 */

/**
 * @typedef {Object} TaskPreview
 * @property {string} id
 * @property {string} title
 * @property {Number} points
 * @property {Array<"nodejs"|"python3"|"java">} langs
 */

/**
 * @typedef {Object} User
 * @property {string} username
 * @property {string} email
 * @property {string} pass
 * @property {"admin"|"student"|"teacher"} usertype
 * @property {string} [sf] snowflake
 */

/**
 * @typedef {Object} Task
 * @property {int} _id
 * @property {string} title
 * @property {string} body
 * @property {Number} points
 * 
 * @property {Array<string>} available_langs
 */

/**
 * @typedef {Object} TaskLog
 * @property {int} _id
 * @property {Date} stamp
 * @property {string} source_path
 * @property {Number} time_used
 * @property {Number} mem_used
 * 
 * @property {string} username
 * @property {int} id_task
 */



export class DBConnector {

    /** @type {string} */
    url;

    /** @type {string} */
    user;

    /** @type {string} */
    pass;

    /** @type {string} */
    db;


    /** @type {mysql.Connection} */
    dbConnection

    constructor(url, user, pass, db) {
        this.url = url;
        this.user = user;
        this.pass = pass;
        this.db = db;
    }

    async connect() {
        this.dbConnection = await mysql.createConnection({
            host: this.url,
            user: this.user,
            password: this.pass,
            database: this.db
        });
    }

    async close() {
        this.dbConnection.destroy();
    }

    /**
     * WIP
     * @param {User} user 
     */
    async createUser(user) {
        console.log(user);

        await this.dbConnection.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?)", [user.username, user.email, user.pass, user.usertype, "no"]);
    }


    /**
     * WIP
     * @param {string} user 
     * @returns {Promise<User>}
    */
    async getUser(email) {
        let [res, _] = await this.dbConnection.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);

        return res[0];
    }

    /**
     * WIP
     * @param {string} sf snowflake
     * @returns {Promise<User>}
    */
    async getUserBySF(sf) {
        let [res, _] = await this.dbConnection.execute("SELECT * FROM users WHERE sf = ? LIMIT 1", [sf]);

        return res[0];
    }

    /**
     * 
     * @returns {Promise<Array<User>>}
     */
    async getAllUsers() {
        let [res, _] = await this.dbConnection.execute("SELECT * FROM users");

        return res;
    }


    /**
     * WIP
     * @param {User} user 
     */
    async deleteUser(user) {

    }

    /**
     * solo pass y snowflake
     * @param {User} user 
     */
    async updateUser(user) {
        console.log(user);
        await this.dbConnection.execute("UPDATE users SET pass = ?, sf = ? WHERE username=?", [user.pass, user.sf, user.username]);
    }





    /**
     * WIP
     * @param {Number} minPoints 
     * @param {Number} maxPoints 
     * @param {Array<string>} langs 
     */
    async readTasks(minPoints, maxPoints, langs) {

    }








    /**
     * 
     * @param {Task} task 
     */
    async addTask(task) {
        let [r, _] = await this.dbConnection.execute("INSERT INTO tasks VALUES (DEFAULT, ?, ?, ?)", [task.title, task.body, task.points]);

        for (let lang of task.langs) {
            await this.dbConnection.execute("INSERT INTO available_langs VALUES (?, ?)", [lang, r.insertId]);
        }

        for (let example of task.examples) {
            console.log([example.entrada, example.salida, example.public, r.insertId]);
            await this.dbConnection.execute("INSERT INTO task_examples VALUES (DEFAULT, ?, ?, ?, ?)", [example.entrada, example.salida, example.public, r.insertId]);
        }
    }

    /**
     * 
     * @param {Number} id 
     * @returns {Promise<Task>|Promise<null>} 
     */
    async getTask(id) {
        /** @type {Task} */
        let task = null;

        let [r, _] = await this.dbConnection.execute("SELECT tasks.*, available_langs.lang FROM tasks, available_langs WHERE tasks._id = available_langs.id_task AND tasks._id = ?", [id]);

        if (r && r[0]) {
            task = {
                id: r[0]._id,
                title: r[0].title,
                body: r[0].body,
                points: +r[0].points,
                examples: [],
                langs: r.map(t => t.lang)
            }
        }

        [r, _] = await this.dbConnection.execute("SELECT * FROM task_examples WHERE id_task = ? AND public = TRUE", [id]);

        for (let example of r) {
            task.examples.push({
                entrada: example.entrada,
                salida: example.salida
            });
        }

        return task;
    }

    /**
     * 
     * @param {Number} id 
     * @returns {Promise<TaskPreview>|Promise<null>} 
     */
    async getTaskPreview(id) {
        let [r, _] = await this.dbConnection.execute("SELECT tasks._id, tasks.title, tasks.points, available_langs.lang FROM tasks, available_langs WHERE tasks._id = available_langs.id_task AND tasks._id = ?", [id]);
        if (r && r[0]) {
            return {
                id: r[0]._id,
                title: r[0].title,
                points: +r[0].points,
                langs: r.map(t => t.lang)
            }
        } else {
            return null;
        }
    }

    /**
     * 
     * @param {number} id
     * @returns {PRomise<Array<TaskExample>>} 
     */
    async getTaskTests(id) {
        let [r, _] = await this.dbConnection.execute("SELECT * FROM task_examples WHERE id_task = ?", [id]);

        return r.map(v => {
            return {
                entrada: v.entrada,
                salida: v.salida,
                public: v.public
            }
        });
    }

    /**
     * 
     * @param {number} page
     * @param {number} batch
     * @returns {Promise<Array<TaskPreview>>} 
     */
    async getTasksPreviews(page, batch) {
        let [r, _] = await this.dbConnection.execute("SELECT _id FROM tasks LIMIT ? OFFSET ?", [batch, page * batch]);
        let out = [];

        for (let task of r) {
            out.push(await this.getTaskPreview(task._id));
        }

        return out;
    }

    /**
     * WIP
     * @param {TaskLog} log 
     */
    async addTaskLog(log) {

    }
}