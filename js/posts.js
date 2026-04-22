import { storage, Parse } from './config.js';
import { currentUserParse } from './auth.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// UI Elements
const postTextEl = document.getElementById('post-text');
const postCodeEl = document.getElementById('post-code');
const codeSnippetContainer = document.getElementById('code-snippet-container');
const addCodeBtn = document.getElementById('add-code-btn');
const postImageInput = document.getElementById('post-image');
const imagePreviewContainer = document.getElementById('image-preview-container');
const postImagePreview = document.getElementById('post-image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');
const submitPostBtn = document.getElementById('submit-post-btn');
const postsContainer = document.getElementById('posts-container');

let selectedImageFile = null;

// Toggle code snippet input
addCodeBtn.addEventListener('click', () => {
    codeSnippetContainer.classList.toggle('hidden');
    if (!codeSnippetContainer.classList.contains('hidden')) {
        postCodeEl.focus();
    } else {
        postCodeEl.value = '';
    }
});

// Handle image selection
postImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            postImagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Remove selected image
removeImageBtn.addEventListener('click', () => {
    selectedImageFile = null;
    postImageInput.value = '';
    imagePreviewContainer.classList.add('hidden');
    postImagePreview.src = '';
});

// Handle Post Submission
submitPostBtn.addEventListener('click', async () => {
    if (!currentUserParse) {
        alert("Você precisa estar logado para publicar.");
        return;
    }

    const textContent = postTextEl.value.trim();
    const codeContent = postCodeEl.value.trim();

    if (!textContent && !codeContent && !selectedImageFile) {
        alert("Escreva algo, adicione um código ou uma imagem para publicar.");
        return;
    }

    const originalBtnText = submitPostBtn.textContent;
    submitPostBtn.textContent = "Publicando...";
    submitPostBtn.disabled = true;

    try {
        let imageUrl = null;

        // Upload image if selected
        if (selectedImageFile) {
            // Using the requested gs:// storage bucket
            const storageRef = ref(storage, `gs://booksdev-3de79.firebasestorage.app/posts/${Date.now()}_${selectedImageFile.name}`);
            const snapshot = await uploadBytes(storageRef, selectedImageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Save to Back4App
        const Post = Parse.Object.extend("Post");
        const post = new Post();

        post.set("textContent", textContent);
        if (codeContent) post.set("codeContent", codeContent);
        if (imageUrl) post.set("imageUrl", imageUrl);
        post.set("author", currentUserParse);

        await post.save();

        // Reset Form
        postTextEl.value = '';
        postCodeEl.value = '';
        codeSnippetContainer.classList.add('hidden');
        selectedImageFile = null;
        postImageInput.value = '';
        imagePreviewContainer.classList.add('hidden');
        postImagePreview.src = '';

        // Refresh Feed
        fetchAndDisplayPosts();

    } catch (error) {
        console.error("Error creating post:", error);
        alert("Erro ao publicar o post. Tente novamente.");
    } finally {
        submitPostBtn.textContent = originalBtnText;
        submitPostBtn.disabled = false;
    }
});

// Fetch and Display Posts
async function fetchAndDisplayPosts() {
    try {
        const Post = Parse.Object.extend("Post");
        const query = new Parse.Query(Post);
        query.include("author"); // Fetch author details
        query.descending("createdAt"); // Newest first
        query.limit(20);

        const results = await query.find();

        postsContainer.innerHTML = '';

        if (results.length === 0) {
            postsContainer.innerHTML = '<div class="text-center text-gray-500 py-8">Nenhum post encontrado. Seja o primeiro a publicar!</div>';
            return;
        }

        results.forEach(post => {
            const author = post.get("author");
            const authorName = author ? author.get("name") : "Usuário Desconhecido";
            const authorPhoto = author ? (author.get("photoURL") || 'https://via.placeholder.com/40') : 'https://via.placeholder.com/40';
            const textContent = post.get("textContent");
            const codeContent = post.get("codeContent");
            const imageUrl = post.get("imageUrl");
            const createdAt = post.createdAt.toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });

            // Build Post HTML
            const postEl = document.createElement('div');
            postEl.className = "bg-white dark:bg-darker p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm fade-in";

            let postHtml = `
                <div class="flex items-center mb-4">
                    <img src="${authorPhoto}" alt="${authorName}" class="w-10 h-10 rounded-full mr-3 border border-gray-300 dark:border-gray-700">
                    <div>
                        <h4 class="font-bold text-gray-900 dark:text-white">${authorName}</h4>
                        <p class="text-xs text-gray-500">${createdAt}</p>
                    </div>
                </div>
            `;

            if (textContent) {
                postHtml += `<p class="text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">${escapeHTML(textContent)}</p>`;
            }

            if (codeContent) {
                postHtml += `
                    <div class="bg-gray-900 rounded-lg p-4 mb-4 overflow-x-auto">
                        <pre><code class="text-green-400 font-mono text-sm">${escapeHTML(codeContent)}</code></pre>
                    </div>
                `;
            }

            if (imageUrl) {
                postHtml += `
                    <div class="mb-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                        <img src="${imageUrl}" alt="Imagem do post" class="w-full h-auto object-cover max-h-96">
                    </div>
                `;
            }

            postHtml += `
                <div class="flex items-center pt-3 border-t border-gray-100 dark:border-gray-800 space-x-4">
                    <button class="flex items-center text-gray-500 hover:text-blue-500 transition">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>
                        <span class="text-sm font-medium">Curtir</span>
                    </button>
                    <button class="flex items-center text-gray-500 hover:text-blue-500 transition">
                        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        <span class="text-sm font-medium">Comentar</span>
                    </button>
                </div>
            `;

            postEl.innerHTML = postHtml;
            postsContainer.appendChild(postEl);
        });

    } catch (error) {
        console.error("Error fetching posts:", error);
        postsContainer.innerHTML = '<div class="text-center text-red-500 py-8">Erro ao carregar o feed.</div>';
    }
}

// Utility to escape HTML to prevent XSS
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Listen for auth ready to fetch initial posts
document.addEventListener('authReady', () => {
    fetchAndDisplayPosts();
});
