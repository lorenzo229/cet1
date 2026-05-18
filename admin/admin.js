import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = { 
    apiKey: "AIzaSyCgcyYdv5SQYP_5vWaitkyUh25P6itECoo", 
    authDomain: "cet1-b8724.firebaseapp.com", 
    projectId: "cet1-b8724", 
    storageBucket: "cet1-b8724.firebasestorage.app", 
    messagingSenderId: "332287385193", 
    appId: "1:332287385193:web:db337733916af4963e0cf8" 
}; 

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const adminNewsList = document.getElementById('admin-news-list');
    const imageInput = document.getElementById('image');
    const previewsContainer = document.getElementById('previews-container');

    // Previsualización de múltiples imágenes
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            previewsContainer.innerHTML = '';
            const files = Array.from(e.target.files);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-img-item';
                    previewsContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Subida de Novedad
    if (uploadForm) {
        uploadForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const originalBtnText = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';

            try {
                const title = document.getElementById('title').value;
                const content = document.getElementById('content').value;
                const imageFiles = Array.from(imageInput.files);
                let imageUrls = [];

                for (const file of imageFiles) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', 'Cet1don');
                    formData.append('api_key', '643818244786437');

                    const cloudRes = await fetch("https://api.cloudinary.com/v1_1/CET1/image/upload", {
                        method: 'POST',
                        body: formData
                    });
                    
                    const cloudData = await cloudRes.json();
                    if (cloudData.secure_url) {
                        imageUrls.push(cloudData.secure_url.replace('/upload/', '/upload/f_auto,q_auto/'));
                    }
                }

                await addDoc(collection(db, "novedades"), {
                    title,
                    content,
                    imageUrls,
                    createdAt: serverTimestamp()
                });

                alert("¡Publicado con éxito!");
                uploadForm.reset();
                previewsContainer.innerHTML = '';
            } catch (error) {
                alert("Error: " + error.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalBtnText;
            }
        };
    }

    // Gestión de Novedades (Borrar)
    if (adminNewsList) {
        const qAdmin = query(collection(db, "novedades"), orderBy("createdAt", "desc"));
        onSnapshot(qAdmin, (snapshot) => {
            adminNewsList.innerHTML = '';
            if (snapshot.empty) {
                adminNewsList.innerHTML = '<p class="text-center text-secondary">No hay novedades publicadas.</p>';
                return;
            }
            snapshot.forEach((newsDoc) => {
                const data = newsDoc.data();
                const firstImg = data.imageUrls && data.imageUrls.length > 0 ? data.imageUrls[0] : 'https://via.placeholder.com/50';
                
                const item = document.createElement('div');
                item.className = 'news-manage-item';
                item.innerHTML = `
                    <img src="${firstImg}" class="news-manage-img">
                    <div class="news-manage-info">
                        <strong>${data.title}</strong>
                        <small>${data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : 'Reciente'}</small>
                    </div>
                    <button class="btn-delete-admin" data-id="${newsDoc.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                `;
                adminNewsList.appendChild(item);
            });

            document.querySelectorAll('.btn-delete-admin').forEach(btn => {
                btn.onclick = async (e) => {
                    const id = e.target.closest('button').dataset.id;
                    if (confirm("¿Estás seguro de que quieres borrar esta novedad?")) {
                        try {
                            await deleteDoc(doc(db, "novedades", id));
                        } catch (err) {
                            alert("Error al borrar: " + err.message);
                        }
                    }
                };
            });
        });
    }

    // Mostrar novedades en Novedades.html (mantiene la lógica del carrusel)
    const newsContainer = document.getElementById('news-realtime-container');
    if (newsContainer) {
        const q = query(collection(db, "novedades"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            newsContainer.innerHTML = '';
            if (snapshot.empty) {
                newsContainer.innerHTML = `<div class="text-center" style="padding: 100px 0;"><h2>Próximamente</h2><p>Vuelve pronto para más noticias.</p></div>`;
                return;
            }
            snapshot.forEach((newsDoc) => {
                const data = newsDoc.data();
                const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Reciente';
                const urls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
                
                const newsItem = document.createElement('div');
                newsItem.className = 'feature-grid';
                newsItem.style.marginBottom = '80px';
                const isEven = newsContainer.children.length % 2 !== 0;
                if (isEven) newsItem.classList.add('reverse');

                let imagesHtml = '';
                if (urls.length > 0) {
                    imagesHtml = `
                    <div class="feature-image">
                        <div class="carousel-container" id="carousel-${newsDoc.id}">
                            ${urls.length > 1 ? `<div class="carousel-counter">1 / ${urls.length}</div>` : ''}
                            ${urls.map((url, index) => `
                                <div class="carousel-slide ${index === 0 ? 'active' : ''}">
                                    <img src="${url}" alt="${data.title}">
                                </div>
                            `).join('')}
                            ${urls.length > 1 ? `
                            <div class="carousel-nav">
                                <button class="carousel-btn prev" onclick="moveCarousel('${newsDoc.id}', -1)"><i class="fas fa-chevron-left"></i></button>
                                <button class="carousel-btn next" onclick="moveCarousel('${newsDoc.id}', 1)"><i class="fas fa-chevron-right"></i></button>
                            </div>
                            ` : ''}
                        </div>
                    </div>`;
                }

                newsItem.innerHTML = `
                    <div class="feature-text">
                        <span class="tech-text" style="font-weight: 600;">${date}</span>
                        <h2 style="font-size: 2rem; margin: 15px 0;">${data.title}</h2>
                        <p>${data.content}</p>
                    </div>
                    ${imagesHtml}
                `;
                newsContainer.appendChild(newsItem);
            });
            if (typeof AOS !== 'undefined') AOS.refresh();
        });
    }
});

window.moveCarousel = (id, direction) => {
    const container = document.getElementById(`carousel-${id}`);
    const slides = container.querySelectorAll('.carousel-slide');
    const counter = container.querySelector('.carousel-counter');
    let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
    slides[activeIndex].classList.remove('active');
    activeIndex = (activeIndex + direction + slides.length) % slides.length;
    slides[activeIndex].classList.add('active');
    if (counter) counter.innerText = `${activeIndex + 1} / ${slides.length}`;
};
