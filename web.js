// ========== USER & AUTH MANAGEMENT ==========
const ADMIN_EMAIL = "shreejan.acharya2025@gmail.com";
const ADMIN_PASSWORD = "6969";

// Auto-create admin account if not exists
function ensureAdminUser() {
    let users = JSON.parse(localStorage.getItem('site_users') || '[]');
    const adminExists = users.some(u => u.email === ADMIN_EMAIL);
    if (!adminExists) {
        users.push({
            name: "Shreejan Acharya",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        localStorage.setItem('site_users', JSON.stringify(users));
    }
}
ensureAdminUser();

function getUsers() {
    return JSON.parse(localStorage.getItem('site_users') || '[]');
}
function saveUsers(users) {
    localStorage.setItem('site_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem('currentUser') || 'null');
}
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function signUp(name, email, password) {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Email already registered.');
        return false;
    }
    users.push({ name, email, password });
    saveUsers(users);
    setCurrentUser({ name, email });
    return true;
}

function signIn(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        setCurrentUser({ name: user.name, email: user.email });
        return true;
    }
    return false;
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.email === ADMIN_EMAIL;
}

// Update nav buttons based on auth state
function updateNavAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const user = getCurrentUser();

    if (loginBtn) loginBtn.style.display = user ? 'none' : 'inline-flex';
    if (signupBtn) signupBtn.style.display = user ? 'none' : 'inline-flex';
    if (logoutBtn) {
        if (user) {
            logoutBtn.style.display = 'inline-flex';
            logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout (${user.name})`;
        } else {
            logoutBtn.style.display = 'none';
        }
    }

    // Admin upload form visibility
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.style.display = isAdmin() ? 'block' : 'none';
    }
}

// Attach logout globally
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Mobile menu toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }
});

// ========== PROJECTS (only on projects page) ==========
function loadProjects() {
    return JSON.parse(localStorage.getItem('site_projects') || '[]');
}
function saveProjects(projects) {
    localStorage.setItem('site_projects', JSON.stringify(projects));
}

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) return;
    const projects = loadProjects();
    container.innerHTML = '';
    if (projects.length === 0) {
        container.innerHTML = '<p style="color:var(--text-secondary);">No projects yet.</p>';
        return;
    }
    projects.forEach((proj, index) => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <div class="project-img">
                ${proj.image ? `<img src="${proj.image}" alt="${proj.title}">` : '<i class="fas fa-code"></i>'}
            </div>
            <div class="card-body">
                <h3>${proj.title}</h3>
                <p style="color:var(--text-secondary); font-size:0.9rem;">${proj.description || ''}</p>
                ${proj.zip ? `<a href="${proj.zip}" class="download-link" target="_blank"><i class="fas fa-download"></i> Download ZIP</a>` : ''}
                ${isAdmin() ? `<button class="delete-btn" onclick="deleteProject(${index})"><i class="fas fa-trash"></i> Delete</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

window.deleteProject = function(index) {
    if (!isAdmin()) return;
    if (!confirm('Delete this project?')) return;
    const projects = loadProjects();
    projects.splice(index, 1);
    saveProjects(projects);
    renderProjects();
};

document.addEventListener('DOMContentLoaded', () => {
    renderProjects();

    const addBtn = document.getElementById('addProjectBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            if (!isAdmin()) {
                alert('Only admin (shreejan.acharya2025@gmail.com) can upload projects.');
                return;
            }
            const title = document.getElementById('projTitle').value.trim();
            if (!title) { alert('Project title required'); return; }
            const newProject = {
                title,
                description: document.getElementById('projDesc').value.trim(),
                image: document.getElementById('projImage').value.trim(),
                zip: document.getElementById('projZip').value.trim()
            };
            const projects = loadProjects();
            projects.push(newProject);
            saveProjects(projects);
            document.getElementById('projTitle').value = '';
            document.getElementById('projDesc').value = '';
            document.getElementById('projImage').value = '';
            document.getElementById('projZip').value = '';
            renderProjects();
        });
    }
});

// ========== COMMENTS (about page) ==========
function loadComments() {
    return JSON.parse(localStorage.getItem('site_comments') || '[]');
}
function saveComments(comments) {
    localStorage.setItem('site_comments', JSON.stringify(comments));
}
function renderComments() {
    const list = document.getElementById('commentsList');
    if (!list) return;
    const comments = loadComments();
    list.innerHTML = '';
    if (comments.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);">No comments yet.</p>';
        return;
    }
    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `<div class="comment-meta">${c.name || 'Anonymous'} · ${c.date}</div><div>${c.message}</div>`;
        list.appendChild(div);
    });
}
document.addEventListener('DOMContentLoaded', () => {
    renderComments();

    const postBtn = document.getElementById('postCommentBtn');
    if (postBtn) {
        postBtn.addEventListener('click', () => {
            const name = document.getElementById('commentName').value.trim();
            const msg = document.getElementById('commentMsg').value.trim();
            if (!msg) { alert('Write a comment'); return; }
            const comments = loadComments();
            comments.push({
                name: name || 'Anonymous',
                message: msg,
                date: new Date().toLocaleString()
            });
            saveComments(comments);
            document.getElementById('commentName').value = '';
            document.getElementById('commentMsg').value = '';
            renderComments();
        });
    }
});
