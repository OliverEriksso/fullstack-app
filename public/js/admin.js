async function loadUsers() {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const userList = document.querySelector("#user-list");

        while (userList.firstChild) {
            userList.removeChild(userList.firstChild);
        }

        users.forEach(user => {
            const userItem = document.createElement("li");

            const userText = document.createElement("span");
            userText.textContent = `${user.username} - Role: ${user.role}`;
            userItem.appendChild(userText);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-user-btn";
            deleteBtn.addEventListener("click", () => deleteUser(user._id, userItem));

            userItem.appendChild(deleteBtn);
            userList.appendChild(userItem);
        })
    } catch (err) {
        console.error("Error loading users:", err);
    }
}

async function deleteUser(userId, userItem) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(`/users/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("User deleted successfully");
            userItem.remove(); 
        } else {
            alert("Failed to delete user");
        }
    } catch (err) {
        console.error("Error deleting user:", err);
        alert("An error occurred while deleting the user.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (role === "admin" && token) {
        loadUsers();
    }
});