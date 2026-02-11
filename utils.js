import { parse } from "csv-parse/sync";
import { DBConnector } from "dbconnector";
import fs from "fs";

/**
 * @typedef {Object} RawCSVTaskObject
 * @property {string} Títol
 * @property {string} Enunciat
 * @property {string} Exemple1
 * @property {string} Exemple2_opcional
 * @property {string} Exemple3_opcional
 * @property {string} Puntuació
 * @property {string} Llenguatges
 */

/** @type {import("./server").Auth} */
const AUTH = JSON.parse(fs.readFileSync("auth.json"));
const dbConnector = new DBConnector(AUTH.url, AUTH.user, AUTH.pass, AUTH.db);

/**
 * 
 * @param {import("dbconnector").Task} task 
 */
async function addTask(task) {
    await dbConnector.addTask({
        title: task.title,
        body: task.body,
        points: task.points,
        examples: task.examples,
        langs: task.langs
    });
}

/**
 * 
 * @param {string} path directori de 
 */
async function dumpTasks(path = "db/tasks.json") {
    /** @type {Array<import("dbconnector").Task>} */
    let tasks = fs.readFileSync(path);

    tasks = JSON.parse(tasks.toString());

    for (let task of tasks) {
        await dbConnector.addTask(task);
    }
}

function transformCSVtoJSON(pathi = "db/problemes.csv", patho = "db/tasks.json") {
    /** @type {Array<RawCSVTaskObject>} */
    let data = parse(fs.readFileSync(pathi).toString(), {
        columns: true,
        skip_empty_lines: true
    });

    /**
     * @type {Array<import("dbconnector").Task>}
     */
    let out = data.map(task => {
        /** @type {Array<import("dbconnector").TaskExample>} */
        let examples = [
            task.Exemple1,
            task.Exemple2_opcional,
            task.Exemple3_opcional,
        ].filter(v => v != "");

        examples = examples.map(te => {
            return {
                entrada: te.substring(te.indexOf("Entrada:"), te.indexOf("Sortida:")).replace("Entrada:", "").trim(),
                salida: te.substring(te.indexOf("Sortida:"), te.length).replace("Sortida:", "").trim(),
                public: true
            }
        })

        return {
            title: task.Títol,
            body: task.Enunciat,
            examples: examples,
            id: null,
            langs: task.Llenguatges.split(",").map(v => v.trim()),
            points: Number.parseFloat(task.Puntuació)
        }
    });

    fs.writeFileSync(patho, JSON.stringify(out, null, 2));
}


async function main() {
    await dbConnector.connect();

    transformCSVtoJSON();
    await dumpTasks();

    // await addTask();
    // console.log(await dbConnector.getTask(1));
    // console.log(await dbConnector.getTaskPreview(1));

    await dbConnector.close();
}

main();