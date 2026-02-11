import { EditorView, basicSetup } from "codemirror"

import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"

const JAVA_MAIN = `
public class Main {
  public static void main(String[] args) {
    
  }
}` + Array(20).fill("\n").join("");

window.addEventListener("DOMContentLoaded", () => {
    let selector = document.getElementById("lang-selector");

    let btn = document.getElementById("send");
    let src = document.getElementById("src");
    let sol = document.getElementById("out");
    let time = document.getElementById("time-data");

    /** @type {import("../../server").EvalPayload} */
    let out = {};


    let editor = new EditorView({
        extensions: [basicSetup, python()],
        parent: src,
        doc: (Array(49).fill("\n")).join("")
    });


    selector.addEventListener("change", () => {
        /** @type {"nodejs"|"python3"|"java"} */
        let options = selector.value;
        let lastText = editor.state.doc.toString();
        src.innerHTML = "";

        switch (options) {
            case "java":
                editor = new EditorView({
                    extensions: [basicSetup, java()],
                    parent: src,
                    doc: JAVA_MAIN
                });
                break;
            case "nodejs":
                editor = new EditorView({
                    extensions: [basicSetup, javascript()],
                    parent: src,
                    doc: lastText
                });
                break;
            case "python3":
                editor = new EditorView({
                    extensions: [basicSetup, python()],
                    parent: src,
                    doc: lastText
                });
                break;
        }
    })


    btn.addEventListener("click", async () => {
        sol.innerText = "";
        time.hidden = true;

        out.code = editor.state.doc.toString();
        out.lang = selector.value;
        out.task_id = (new URLSearchParams(document.location.search)).get("id");

        let res = await fetch("/eval", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(out)
        });

        res = await res.json();

        sol.innerText = res.err !== "" ? res.err : res.out;
        time.hidden = false;
        time.getElementsByTagName("span")[0].innerText = (res.time * 1000).toFixed(4);
    });
})
