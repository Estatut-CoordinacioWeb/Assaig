import fs from 'fs';

import express from 'express';

import { exec, loadSolution } from "docker"

import { DBConnector } from "dbconnector";

import { createHash } from "crypto"
import cookieParser from 'cookie-parser';


// !!!!!! ojo cuidao: NO COMPATIBLE CON SHARDING !!!!!!
// guardado en memoria de credenciales para acceso rapido
const USERS = {};

function encrypt(email, password) {
    return createHash("sha256").update(email).digest("hex") + "=" + createHash("sha512").update(email + password).digest("base64");
}

function generateSnowflake(email, password) {
    return createHash("sha512").update(email + password + (new Date()).toLocaleString()).digest("base64");
}

async function loadUsersSFs() {
    let users = await dbConnector.getAllUsers();

    for (let user of users) {
        if (user.sf !== "no") USERS[user.sf] = user;
    }
}




/**
 * @typedef {Object} Auth
 * @property {string} url
 * @property {string} user
 * @property {string} pass
 * @property {string} db
 * @property {string} session_secret
 */

/** @type {Auth} */
const AUTH = JSON.parse(fs.readFileSync("auth.json"));
const dbConnector = new DBConnector(AUTH.url, AUTH.user, AUTH.pass, AUTH.db);

const app = express()
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser(AUTH.session_secret));

const __dirname = import.meta.dirname;






/**
 * @typedef {Object} EvalPayload
 * @property {string} task_id
 * @property {"nodejs"|"python3"|"java"} lang
 * @property {string} code
 */

/**
 * @typedef {Object} RegisterPayload
 * @property {string} username
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} GetTasksPayload
 * @property {number} batch
 * @property {number} page
 */

/**
 * @typedef {Object} GetTaskPayload
 * @property {number} id
 */










app.post("/eval", async (req, res) => {
    if (!req.signedCookies["sf"] || req.signedCookies["sf"] == "no") {
        res.send({ status: "Auth required" });
        return;
    }

    console.log(req.signedCookies);

    /** @type {EvalPayload} */
    let body = req.body;

    // Plan:
    // 1. get task requirements/config: max mem & timeout
    // 2. move payload to folder
    // 3. execute tests on host
    // 4. get results and send to origin



    // 2 WIP test
    await loadSolution(body, dbConnector);

    // 3 WIP
    let out = exec({
        lang: body.lang,
        maxMemory: 128,
        maxTime: 10,
        taskID: 0
    });

    console.log(out);

    res.send(out);
});


app.get("/logout", async (req, res) => {
    if (req.signedCookies["sf"]) {
        let user = await dbConnector.getUserBySF(req.signedCookies["sf"]);

        delete USERS[user.sf];

        user.sf = "no";
        await dbConnector.updateUser(user);


        res.clearCookie("sf");
    }


    res.redirect("/");
});

app.post("/login", async (req, res) => {
    /** @type {LoginPayload} */
    let body = req.body;

    let user = await dbConnector.getUser(body.email);
    if (user && user.pass !== encrypt(body.email, body.password)) {
        res.send({
            status: "Bad"
        });
        return;
    }

    let sf = generateSnowflake(body.email, body.password);
    user.sf = sf;
    dbConnector.updateUser(user);

    res.cookie("sf", sf, { signed: true, maxAge: 7 * 24 * 60 * 60 * 1000 });

    USERS[sf] = user;

    res.send({
        status: "OK"
    });
});


app.post("/register", async (req, res) => {
    /** @type {RegisterPayload} */
    let body = req.body;

    // checks
    if (body.email == "" || body.username == "" || body.password == "") {
        res.send({
            status: "Missing"
        });

        return;
    }

    try {
        await dbConnector.createUser({
            email: body.email,
            pass: encrypt(body.email, body.password),
            username: body.username,
            usertype: "student"
        });
    } catch (e) {
        res.send({
            status: "Duplicated"
        });
        return;
    }

    res.send({
        status: "OK"
    });
});

app.post("/self", (req, res) => {
    let sf = req.signedCookies["sf"];

    // logged
    if (sf && USERS[sf]) {
        /** @type {import('dbconnector').User} */
        let out = { ...USERS[sf] };
        out.pass = "";

        res.send(out);
    } else {
        res.send({});
    }
});

app.post("/get_tasks", async (req, res) => {
    let sf = req.signedCookies["sf"];

    /** @type {GetTasksPayload} */
    let body = req.body;

    // logged
    if (sf && USERS[sf]) {
        res.send(await dbConnector.getTasksPreviews(+body.page, +body.batch));

    } else {
        res.send({});
    }
});

app.post("/get_task", async (req, res) => {
    let sf = req.signedCookies["sf"];

    /** @type {GetTaskPayload} */
    let body = req.body;

    // logged
    if (sf && USERS[sf]) {
        res.send(await dbConnector.getTask(body.id));

    } else {
        res.send({});
    }
});




app.get("/{*why}", (req, res) => {
    // general files
    if (req.query.g) {
        res.sendFile(__dirname + "/public/general" + req.path);
        return;
    }


    let sf = req.signedCookies["sf"];

    // logged
    if (sf && USERS[sf]) {
        res.sendFile(__dirname + `/public/${USERS[sf].usertype}` + req.path);

        // guest
    } else {

        res.sendFile(__dirname + "/public/guest" + req.path);
    }
});

app.listen(port, async () => {
    await dbConnector.connect();
    await loadUsersSFs();

    console.log(USERS);

    console.log("Open");
});