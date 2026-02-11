window.addEventListener("DOMContentLoaded", () => {
    let send = document.getElementsByTagName("form")[0].getElementsByTagName("button")[0];
    let inputs = document.getElementsByTagName("input");

    /** @type {import("../../server").LoginPayload} */
    let out = {}

    let loading = false;

    send.addEventListener("click", async () => {
        if (loading) return;

        out.email = inputs[0].value;
        out.password = inputs[1].value;

        loading = true;
        let res = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(out),
            credentials: "include"
        });
        loading = false;

        console.log(await res.json());
    });
});