document.querySelector("#register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.querySelector("#register-username").value;
    const password = document.querySelector("#register-password").value;

    const response = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
    
    if (response.ok) {
        document.querySelector("#register-div").classList.add("hidden");
        document.querySelector("#login-div").classList.remove("hidden");
    }
})

document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.querySelector("#login-username").value;
    const password = document.querySelector("#login-password").value;

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        console.log("Login successful. User ID:", data.userId);
        document.querySelector("#login-div").classList.add("hidden");
        localStorage.setItem("token", data.token); 
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("role", data.role);
        localStorage.setItem("username", username);

        alert("Login success!");
        setTimeout(() => loadPosts(), 500); 
        window.location.reload();
    } else {
        alert(data.message);
    }
})



document.querySelector("#google-login-btn").addEventListener("click", () => {
    window.location.href = "http://localhost:3000/auth/google"; 
});

if (window.location.pathname === "/login-success") {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const role = urlParams.get("role");
    const userId = urlParams.get("userId");

    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);

        alert(`Welcome, ${username}!`);
        window.location.href = "/";
    } else {
        alert("Login failed.");
        window.location.href = "/";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const username = urlParams.get("username");
    const role = urlParams.get("role");
    const userId = urlParams.get("userId");

    if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userId);

        window.history.replaceState({}, document.title, "/");

        window.location.reload();
    }
});

