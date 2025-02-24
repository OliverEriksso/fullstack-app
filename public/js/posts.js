document.getElementById("create-post-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Login required");
        return;
    }

    try {
        const response = await fetch ("/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        })
        if (response.ok) {
            e.target.reset();
            document.getElementById('create-post-div').classList.add('hidden'); 
            await loadPosts();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch(err) {
        console.error("Error:", err);
        alert("Failed to create post");
    }
});

async function loadPosts() {
    try {
        const token = localStorage.getItem("token"); 
        const response = await fetch("/posts", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}` 
        }
        });

        if (!response.ok) throw new Error("Failed to fetch posts");
        const posts = await response.json(); 

        const container = document.getElementById("created-posts-div");
        container.replaceChildren(); 

        if (posts.length === 0) {
            const noPosts = document.createElement("p");
            noPosts.textContent = "No posts yet, post something!";
            container.appendChild(noPosts);
            return;
        }

        posts.forEach(post => { 
            const postContainer = document.createElement("div");
            const postTitle = document.createElement("h4");
            const postContent = document.createElement("p");
            const postMeta = document.createElement("small");

            postContainer.className = "post-container";

            postTitle.textContent = post.title;
            postContent.textContent = post.content;
            postMeta.textContent = post.author ? `Posted by: ${post.author.username} • ${new Date(post.createdAt).toLocaleDateString()}` : "Posted by: [Deleted User]";

            const commentsBtn = document.createElement("button");
            commentsBtn.textContent = "Comments";
            commentsBtn.className = "comments-btn";
            commentsBtn.addEventListener("click", () => openComments(post._id));

            postContainer.appendChild(postTitle);
            postContainer.appendChild(postContent);
            postContainer.appendChild(postMeta);
            postContainer.appendChild(commentsBtn);

            if (localStorage.getItem("role") === "admin" || (post.author && post.author._id === localStorage.getItem("userId"))) {
                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.className = "edit-post-btn";
                editBtn.addEventListener("click", () => handleEditPost(post._id));

                const removeBtn = document.createElement("button");
                removeBtn.textContent = "Delete";
                removeBtn.className = "remove-post-btn";
                removeBtn.addEventListener("click", () => deletePost(post._id));
            
                postContainer.appendChild(editBtn);
                postContainer.appendChild(removeBtn);
            }

            container.appendChild(postContainer);
        })
    } catch (err) {
        console.error('Error loading posts:', err);
        const errorEl = document.createElement('p');
        errorEl.textContent = 'Error loading posts';
        document.getElementById('created-posts-div').appendChild(errorEl);
    }
}

async function handleEditPost(postId) {
    const newTitle = prompt("Enter new title:");
    const newContent = prompt("Enter new content:");
    
    if (!newTitle || !newContent) return;

    try {
        const response = await fetch (`/posts/${postId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ title: newTitle, content: newContent })
        });

        if (response.ok) {
            await loadPosts(); 
          } else {
            alert("Failed to update post");
          }
    } catch (err) {
        console.error("Error:", err);
    }
}

async function deletePost(postId) {
    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        if (response.ok) {
            await loadPosts();
        } else {
            alert("Failed to delete post");
        }

    } catch (err) {
        console.error("Error deleting post:", err);
        alert("An error occurred while deleting the post.");
    }
}

loadPosts();





async function openComments(postId) {
    const modal = document.getElementById("comments-modal");
    const commentsList = document.getElementById("comments-list");
    const likeCount = document.getElementById("like-count");
    const likeButton = document.getElementById("like-button");
    const likedByList = document.getElementById("liked-by-list");

    modal.dataset.postId = postId; 

    try {
        const response = await fetch(`/posts/${postId}/details`);
        if (!response.ok) throw new Error("Failed to fetch post details");

        const { comments, likes } = await response.json();

        commentsList.textContent = "";
        comments.forEach(comment => {
            const li = document.createElement("li");
            li.textContent = `${comment.author.username}: ${comment.text}`;
            commentsList.appendChild(li);
        });

        likeCount.textContent = `Likes: ${likes.length}`;
        likeButton.textContent = likes.some(like => like._id === localStorage.getItem("userId")) ? "Unlike" : "Like";

        likedByList.textContent = likes.length > 0 ? "Liked by: " + likes.map(like => like.username).join(", ") : "No likes yet.";

        modal.style.display = "block";
    } catch (err) {
        console.error("Error loading comments:", err);
    }
}

async function submitComment() {
    const postId = document.getElementById("comments-modal").dataset.postId;
    const text = document.getElementById("comment-input").value;

    if (!text) return;

    const csrfToken = document.cookie
        .split("; ")
        .find(row => row.startsWith("csrf-token="))
        ?.split("=")[1];

    try {
        const response = await fetch(`/posts/${postId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "X-CSRF-Token": csrfToken
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) throw new Error("Failed to add comment");

        document.getElementById("comment-input").value = "";
        openComments(postId); 
    } catch (err) {
        console.error("Error adding comment:", err);
    }
}

async function toggleLike() {
    const postId = document.getElementById("comments-modal").dataset.postId;

    try {
        const response = await fetch(`/posts/${postId}/like`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (!response.ok) throw new Error("Failed to like post");

        openComments(postId); 
    } catch (err) {
        console.error("Error liking post:", err);
    }
}

function closeComments() {
    document.getElementById("comments-modal").style.display = "none";
}
