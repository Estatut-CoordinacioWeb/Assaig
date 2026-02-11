import { execSync } from "child_process"
import fs from "fs";

/**
 * @typedef {Object} ExecPayload
 * @property {Number} maxMemory max memory in MB
 * @property {Number} maxTime max time in seconds
 * @property {Number} taskID task identifyer
 * @property {"nodejs"|"python3"|"java"} lang programming language of the solution
 */

/**
 * @typedef {Object} LoadFilePayload
 * @property {string} task_id task identifyer
 * @property {string} code source code of the solution
 * @property {"nodejs"|"python3"|"java"} lang programming language of the solution
 */

/**
 * @typedef {Object} ResultPayload
 * @property {string} out stdout
 * @property {string} err stderr
 * @property {Number} time time elapsed
 * @property {string} status eval status
 */

const ERROR_CODES = {
    "OOM": 137
}

/**
 * 
 * @param {LoadFilePayload} payload 
 * @param {import('dbconnector').DBConnector} dbConnector 
 */
export async function loadSolution(payload, dbConnector) {
    const EXT = {
        "nodejs": ".js",
        "python3": ".py",
        "java": ".java"
    };

    let tests = await dbConnector.getTaskTests(+payload.task_id);

    fs.writeFileSync("workers/" + payload.lang + "/tests.json", JSON.stringify(tests));

    if (payload.lang === "java") {
        fs.writeFileSync("workers/" + payload.lang + "/Main.java", payload.code);

    } else {

        fs.writeFileSync("workers/" + payload.lang + "/current" + EXT[payload.lang], payload.code);
    }

    // console.log("Loaded solution");
}

/**
 * 
 * @param {ExecPayload} payload 
 * @returns {ResultPayload}
 */
export function exec(payload) {
    let out = {};

    switch (payload.lang) {
        case "nodejs":
            out = execNode(payload);
            break;
        case "python3":
            out = execPython(payload);
            break;
        case "java":
            out = execJava(payload);
            break;
    }

    return out;
}

/**
 * 
 * @param {ExecPayload} payload 
 */
function loadConfig(payload) {
    let path = "workers/" + payload.lang + "/config.json"
    let config = JSON.parse(fs.readFileSync(path));

    config.maxMemory = payload.maxMemory;
    config.maxTime = payload.maxTime;

    fs.writeFileSync(path, JSON.stringify(config));
}

/**
 * 
 * @param {ExecPayload} payload 
 * @returns {ResultPayload}
 */
function execPython(payload) {
    let out = {
        out: null,
        err: null,
        time: null,
        status: null
    }

    // WIP: comprobar que no haya excepcion aqui (error 500)
    execSync("docker build -t crwded/python3 ./workers/python3/", {
        stdio: "ignore"
    });

    loadConfig(payload);

    try {
        let msg = execSync(`docker run --rm --read-only --pids-limit=64 --cpus=0.5 --memory=${payload.maxMemory}m --memory-swap=${payload.maxMemory}m --network=none --cap-drop=ALL --security-opt=no-new-privileges crwded/python3`);
        console.log(msg.toString());
        out = JSON.parse(msg.toString());

    } catch (e) {
        console.log(e);
        out.status = e.status;
    }

    return out;
}


/**
 * 
 * @param {ExecPayload} payload 
 * @returns {ResultPayload}
 */
function execNode(payload) {
    let out = {
        out: null,
        err: null,
        time: null,
        status: null
    }

    // WIP: comprobar que no haya excepcion aqui (error 500)
    execSync("docker build -t crwded/nodejs ./workers/nodejs/", {
        stdio: "ignore"
    });

    loadConfig(payload);

    try {
        let msg = execSync(`docker run --rm --read-only --pids-limit=64 --cpus=0.5 --memory=${payload.maxMemory}m --memory-swap=${payload.maxMemory}m --network=none --cap-drop=ALL --security-opt=no-new-privileges crwded/nodejs`);
        console.log(msg.toString());
        out = JSON.parse(msg.toString());

    } catch (e) {
        console.log(e);
        out.status = e.status;
    }

    return out;
}


/**
 * 
 * @param {ExecPayload} payload 
 * @returns {ResultPayload}
 */
function execJava(payload) {
    let out = {
        out: null,
        err: null,
        time: null,
        status: null
    }

    // WIP: comprobar que no haya excepcion aqui (error 500)
    execSync("docker build -t crwded/java ./workers/java/", {
        stdio: "ignore"
    });

    loadConfig(payload);

    try {
        let msg = execSync(`docker run --rm --pids-limit=64 --cpus=0.5 --memory=${payload.maxMemory}m --memory-swap=${payload.maxMemory}m --network=none --cap-drop=ALL --security-opt=no-new-privileges crwded/java`);
        console.log(msg.toString());
        out = JSON.parse(msg.toString());

    } catch (e) {
        console.log(e);
        out.status = e.status;
    }

    return out;
}