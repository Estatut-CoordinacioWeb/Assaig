window.addEventListener("DOMContentLoaded", () => {
    let send = document.getElementsByTagName("form")[0].getElementsByTagName("button")[0];
    let inputs = document.getElementsByTagName("input");

    /** @type {import("../../server").RegisterPayload} */
    let out = {}

    let loading = false;

    send.addEventListener("click", async () => {
        if (loading) return;

        out.username = inputs[0].value
        out.email = inputs[1].value
        out.password = inputs[2].value

        loading = true;
        let res = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(out)
        });
        loading = false;

        console.log(await res.json());
    });
});