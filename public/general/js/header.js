window.addEventListener("DOMContentLoaded", async () => {
    let menu = document.getElementsByClassName("auth-menu")[0];
    if (!menu) return;

    let res = await fetch("/self", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    });
    
    /** @type {import("dbconnector").User} */
    let user = await res.json();

    for(let e of document.getElementsByClassName("username-txt")){
        e.innerText = user.username;
    }
});