document.querySelector("#login-li").addEventListener("click", () => {
    const loginDiv = document.querySelector("#login-div");
    const regiDiv = document.querySelector("#register-div");

    if (!regiDiv.classList.contains("hidden")) {
        regiDiv.classList.add("hidden");
      }
    loginDiv.classList.toggle("hidden");
    updateUI();
})

document.querySelector("#register-li").addEventListener("click", () => {
    const loginDiv = document.querySelector("#login-div");
    const regiDiv = document.querySelector("#register-div");

    if (!loginDiv.classList.contains("hidden")) {
        loginDiv.classList.add("hidden");
    }
    regiDiv.classList.toggle("hidden");
    updateUI();
})

document.getElementById("new-post-btn").addEventListener("click", () => {
    const postDiv = document.getElementById("create-post-div");
    postDiv.classList.toggle("hidden");
});

function updateUI() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");

    const role = localStorage.getItem("role");
    const adminPanel = document.getElementById("admin-panel");
    if (role === "admin") {
        adminPanel.classList.remove("hidden"); 
    } else {
        adminPanel.classList.add("hidden"); 
    }

    const loginDiv = document.querySelector("#login-li"); 
    const registerDiv = document.querySelector("#register-li");
    const userInfoDiv = document.querySelector("#user-info");
    const loggedInUser = document.querySelector("#logged-in-user");

    if (token && username) {
        if (loginDiv) loginDiv.classList.add("hidden");
        if (registerDiv) registerDiv.classList.add("hidden");

        userInfoDiv.classList.remove("hidden");
        loggedInUser.textContent = `Logged in as ${username}`;
    } else {
        if (loginDiv) loginDiv.classList.remove("hidden");
        if (registerDiv) registerDiv.classList.remove("hidden");

        userInfoDiv.classList.add("hidden");
    }
}

updateUI();

const logoutBtn = document.querySelector("#logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        localStorage.removeItem("username");
        loadPosts();
        updateUI();
    });
}




if (localStorage.getItem("role") === "admin") {
    document.getElementById("admin-panel").classList.remove("hidden");
}