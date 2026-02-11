let currentTaskId = null;

/**
 * @callback OnOpenModal
 * @param {import("dbconnector").TaskPreview} task 
 */


/**
 * @param {Array<import("dbconnector").TaskPreview>} tasks 
 * @param {OnOpenModal} onClick 
 */
function showTasks(tasks, onClick) {
    for (let task of tasks) {
        let domTask = document.createElement("div");
        domTask.classList.add("task-preview");
        domTask.setAttribute("tabindex", "0");

        domTask.innerHTML = `
        <div>${task.title}</div>
        <div>${task.points}</div>
        <div>${task.langs.map(l => "<img src='/assets/lang_icons/" + l + ".svg?g=1'></img>").join("")}</div>
        `;

        domTask.addEventListener("click", () => { onClick(task) });
        document.getElementsByTagName("main")[0].appendChild(domTask);
    }
}

async function loadModalTask(id) {
    currentTaskId = id;

    /** @type {import("../../../server").GetTaskPayload} */
    let payload = {
        id: id
    };

    let res = await fetch("/get_task", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    /** @type {import("dbconnector").Task} */
    let task = await res.json();

    document.getElementById("m-title").innerText = task.title;
    document.getElementById("m-body").innerText = task.body;
    // document.getElementById("m-points").innerText = task.points;
    // document.getElementById("m-langs").innerText = task.langs.join(", ");
    document.getElementById("m-examples").innerHTML = task.examples.map(e => `<div class="m-example"><div>Entrada:<div>${e.entrada}</div></div><div>Sortida:<div>${e.salida}</div></div></div>`).join("");
    document.getElementById("m-b-task").blur(); // para que no quede marcado el boton de solucion
}

window.addEventListener("DOMContentLoaded", async () => {
    let taskModal = document.getElementById("task-preview");

    /** @type {import("../../../server").GetTasksPayload} */
    let values = {
        batch: 50,
        page: 0
    };

    document.getElementById("m-b-task").addEventListener("click", () => {
        window.location.href = "/pages/editor.html?id=" + currentTaskId;
    });

    let res = await fetch("/get_tasks", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
    });

    showTasks(await res.json(), async (task) => {
        taskModal.close();

        loadModalTask(task.id);

        taskModal.showModal();
    });
});