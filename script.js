// Configuración para GitHub Pages
const RUTA_FOTO = "assets/1.jpg"; // ¡CAMBIA ESTO!
let piezasColocadas = new Array(9).fill(false);
let piezasData = [];

// Variables para el drag táctil
let piezaSeleccionada = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let piezaOriginal = null;

// FRASES DE AMOR
const frasesAmor = [
    "💕 Desde que te conocí, mi vida tiene colores que no sabía que existían.",
    "💗 Tu sonrisa es mi lugar favorito en el mundo.",
    "💖 Cada día a tu lado es un regalo que atesoro.",
    "💝 Eres la razón por la que creo en el amor verdadero.",
    "💘 Cuando te veo, mi corazón late más rápido.",
    "💓 Contigo aprendí que el amor sí existe y es bonito.",
    "💞 Eres mi persona favorita, mi paz, mi todo.",
    "💕 No necesito nada más si te tengo a ti.",
    "💗 Gracias por existir y por llegar a mi vida.",
    "💖 Eres el mejor 'hola' y el mejor 'te amo'.",
    "💝 Mi lugar seguro es entre tus brazos.",
    "💘 Cada momento contigo es mi momento favorito.",
    "💓 Te elijo hoy, mañana y siempre.",
    "💞 Eres mi hoy y todos mis mañanas.",
    "💕 Si el amor es una locura, no quiero estar cuerdo."
];

function mostrarToast(mensaje) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = mensaje;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Cortar la imagen - VERSIÓN CORREGIDA PARA GITHUB
function cortarImagen() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        // IMPORTANTE: Forzar que no use caché
        img.src = RUTA_FOTO + '?t=' + Date.now();
        
        img.crossOrigin = 'Anonymous'; // Para evitar CORS
        
        img.onload = function() {
            console.log('✅ Imagen cargada exitosamente');
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Hacer la imagen cuadrada
            const size = Math.min(img.width, img.height);
            const startX = (img.width - size) / 2;
            const startY = (img.height - size) / 2;
            
            const pieceSize = size / 3;
            
            canvas.width = pieceSize;
            canvas.height = pieceSize;
            
            const piezas = [];
            
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    ctx.clearRect(0, 0, pieceSize, pieceSize);
                    ctx.drawImage(
                        img,
                        startX + (col * pieceSize), 
                        startY + (row * pieceSize),
                        pieceSize, pieceSize,
                        0, 0,
                        pieceSize, pieceSize
                    );
                    
                    const pieceNumber = row * 3 + col + 1;
                    piezas.push({
                        id: pieceNumber,
                        row: row,
                        col: col,
                        position: pieceNumber - 1,
                        dataUrl: canvas.toDataURL('image/jpeg', 0.95)
                    });
                }
            }
            
            resolve(piezas);
        };
        
        img.onerror = function(error) {
            console.error('❌ Error al cargar la imagen:', error);
            console.log('Ruta intentada:', RUTA_FOTO);
            
            // Crear piezas de respaldo con números
            const piezasRespaldo = [];
            for (let i = 0; i < 9; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                
                // Fondo rosa
                ctx.fillStyle = '#ff6b8b';
                ctx.fillRect(0, 0, 200, 200);
                
                // Número grande
                ctx.fillStyle = 'white';
                ctx.font = 'bold 80px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i + 1, 100, 100);
                
                piezasRespaldo.push({
                    id: i + 1,
                    row: Math.floor(i / 3),
                    col: i % 3,
                    position: i,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.95)
                });
            }
            
            alert('⚠️ No pude cargar la foto. Asegúrate de que:\n\n1. La foto esté en: assets/1.jpg\n2. El nombre sea exactamente "1.jpg"\n3. Hayas hecho "git add ." y "git commit"\n\nPor ahora usaremos piezas de respaldo.');
            
            resolve(piezasRespaldo);
        };
    });
}

function mostrarFraseAmor() {
    const messageText = document.getElementById('messageText');
    const fraseAleatoria = frasesAmor[Math.floor(Math.random() * frasesAmor.length)];
    messageText.textContent = fraseAleatoria;
    
    const loveMessage = document.querySelector('.love-message');
    loveMessage.style.animation = 'none';
    loveMessage.offsetHeight;
    loveMessage.style.animation = 'heartbeat 1s ease';
    
    if (window.innerWidth <= 900) {
        mostrarToast(fraseAleatoria);
    }
}

// ========== SISTEMA DE ARRASTRE TÁCTIL ==========
function iniciarArrastre(e, piezaElement, pieceId) {
    e.preventDefault();
    e.stopPropagation();
    
    if (piezaElement.classList.contains('placed')) {
        return;
    }
    
    piezaSeleccionada = pieceId;
    piezaOriginal = piezaElement;
    
    const clon = piezaElement.cloneNode(true);
    clon.id = 'pieza-flotante';
    clon.style.position = 'fixed';
    clon.style.width = piezaElement.offsetWidth + 'px';
    clon.style.height = piezaElement.offsetHeight + 'px';
    clon.style.zIndex = '9999';
    clon.style.opacity = '0.9';
    clon.style.transform = 'scale(1.1)';
    clon.style.pointerEvents = 'none';
    clon.style.boxShadow = '0 10px 30px rgba(255, 59, 111, 0.5)';
    
    document.body.appendChild(clon);
    
    let touch = e.touches ? e.touches[0] : e;
    touchOffsetX = touch.clientX - piezaElement.getBoundingClientRect().left;
    touchOffsetY = touch.clientY - piezaElement.getBoundingClientRect().top;
    
    clon.style.left = (touch.clientX - touchOffsetX) + 'px';
    clon.style.top = (touch.clientY - touchOffsetY) + 'px';
    
    piezaElement.style.opacity = '0.3';
    
    document.querySelectorAll('.empty-slot').forEach(slot => {
        slot.style.border = '3px dashed #ff3b6f';
        slot.style.backgroundColor = 'rgba(255, 107, 139, 0.1)';
    });
}

function moverArrastre(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!piezaSeleccionada) return;
    
    const clon = document.getElementById('pieza-flotante');
    if (clon) {
        let touch = e.touches ? e.touches[0] : e;
        clon.style.left = (touch.clientX - touchOffsetX) + 'px';
        clon.style.top = (touch.clientY - touchOffsetY) + 'px';
    }
}

function terminarArrastre(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!piezaSeleccionada || !piezaOriginal) return;
    
    const clon = document.getElementById('pieza-flotante');
    if (clon) clon.remove();
    
    piezaOriginal.style.opacity = '1';
    
    document.querySelectorAll('.empty-slot').forEach(slot => {
        slot.style.border = '2px dashed #ff99aa';
        slot.style.backgroundColor = 'rgba(255, 220, 230, 0.7)';
    });
    
    let touch = e.changedTouches ? e.changedTouches[0] : e;
    let elementoDebajo = document.elementFromPoint(touch.clientX, touch.clientY);
    
    let slotEncontrado = null;
    while (elementoDebajo) {
        if (elementoDebajo.classList && elementoDebajo.classList.contains('empty-slot')) {
            slotEncontrado = elementoDebajo;
            break;
        }
        elementoDebajo = elementoDebajo.parentElement;
    }
    
    if (slotEncontrado) {
        const position = parseInt(slotEncontrado.dataset.position);
        colocarPieza(piezaSeleccionada, position, slotEncontrado);
    }
    
    piezaSeleccionada = null;
    piezaOriginal = null;
}
// ========== FIN SISTEMA DE ARRASTRE ==========

// Inicializar juego
async function inicializarPuzzle() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    const piecesContainer = document.getElementById('piecesContainer');
    
    puzzleBoard.innerHTML = '';
    piecesContainer.innerHTML = '';
    
    piezasColocadas = new Array(9).fill(false);
    document.getElementById('finalQuestion').classList.remove('show');
    document.getElementById('messageText').textContent = '💝 Toca y arrastra las piezas para armarlo';
    
    // Crear espacios vacíos
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'empty-slot';
        slot.dataset.position = i;
        slot.textContent = '✨';
        
        slot.addEventListener('touchstart', (e) => e.preventDefault());
        slot.addEventListener('touchmove', (e) => e.preventDefault());
        
        puzzleBoard.appendChild(slot);
    }
    
    try {
        piezasData = await cortarImagen();
        const piezasMezcladas = [...piezasData].sort(() => Math.random() - 0.5);
        
        piezasMezcladas.forEach((pieza) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'puzzle-piece';
            pieceDiv.dataset.pieceId = pieza.id;
            pieceDiv.dataset.position = pieza.position;
            
            const img = document.createElement('img');
            img.src = pieza.dataUrl;
            img.alt = `Pieza ${pieza.id}`;
            pieceDiv.appendChild(img);
            
            // Eventos táctiles
            pieceDiv.addEventListener('touchstart', (e) => {
                e.preventDefault();
                iniciarArrastre(e, pieceDiv, pieza.id);
            }, { passive: false });
            
            pieceDiv.addEventListener('touchmove', (e) => {
                e.preventDefault();
                moverArrastre(e);
            }, { passive: false });
            
            pieceDiv.addEventListener('touchend', (e) => {
                e.preventDefault();
                terminarArrastre(e);
            }, { passive: false });
            
            pieceDiv.addEventListener('touchcancel', (e) => {
                e.preventDefault();
                terminarArrastre(e);
            }, { passive: false });
            
            // Eventos de mouse
            pieceDiv.addEventListener('mousedown', (e) => {
                e.preventDefault();
                iniciarArrastre(e, pieceDiv, pieza.id);
            });
            
            document.addEventListener('mousemove', (e) => {
                if (piezaSeleccionada) {
                    e.preventDefault();
                    moverArrastre(e);
                }
            });
            
            document.addEventListener('mouseup', (e) => {
                if (piezaSeleccionada) {
                    e.preventDefault();
                    terminarArrastre(e);
                }
            });
            
            piecesContainer.appendChild(pieceDiv);
        });
        
        actualizarContador();
        
    } catch (error) {
        console.error('Error:', error);
    }
}

function colocarPieza(pieceId, position, slotElement) {
    if (piezasColocadas[position]) {
        mostrarToast('💝 Esta posición ya tiene una pieza');
        return;
    }
    
    const piezaElement = document.querySelector(`[data-piece-id="${pieceId}"]`);
    if (!piezaElement) {
        mostrarToast('💝 Esta pieza ya fue colocada');
        return;
    }
    
    const piezaData = piezasData.find(p => p.id == pieceId);
    if (piezaData.position !== position) {
        mostrarToast('✨ Esta pieza no va aquí, mira la foto completa');
        return;
    }
    
    piezasColocadas[position] = true;
    
    const piecePlaced = document.createElement('div');
    piecePlaced.className = 'piece-placed';
    
    const img = document.createElement('img');
    img.src = piezaData.dataUrl;
    img.alt = `Pieza ${piezaData.id}`;
    
    piecePlaced.appendChild(img);
    
    slotElement.innerHTML = '';
    slotElement.className = 'piece-placed';
    slotElement.appendChild(img);
    slotElement.dataset.position = position;
    
    piezaElement.remove();
    
    mostrarFraseAmor();
    
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    confetti({
        particleCount: 10,
        spread: 30,
        origin: { y: 0.7 },
        colors: ['#ff6b8b', '#ff99aa']
    });
    
    actualizarContador();
    
    if (piezasColocadas.every(p => p === true)) {
        completarPuzzle();
    }
}

function actualizarContador() {
    const colocadas = piezasColocadas.filter(p => p).length;
    document.getElementById('piecesPlaced').textContent = colocadas;
    document.getElementById('progressFill').style.width = (colocadas / 9 * 100) + '%';
}

function completarPuzzle() {
    document.getElementById('finalQuestion').classList.add('show');
    document.getElementById('messageText').textContent = '💖 ¡COMPLETASTE EL ROMPECABEZAS! 💖 Eres la pieza que faltaba en mi vida.';
    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6, x: 0.3 + (i * 0.2) },
                colors: ['#ff6b8b', '#ff3b6f', '#ff99aa', '#ffb6c1']
            });
        }, i * 200);
    }
}

function reiniciarPuzzle() {
    inicializarPuzzle();
    confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#ffd3b6']
    });
}

function celebrar() {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 90,
                origin: { y: 0.6, x: 0.1 + (i * 0.1) },
                colors: ['#ff6b8b', '#ff3b6f', '#ff99aa', '#ffc0cb', '#ffb6c1']
            });
        }, i * 100);
    }
    
    setTimeout(() => {
        mostrarToast('💖 ¡TE AMO! 💖 Gracias por ser mi San Valentín');
    }, 500);
    
    const btn = document.querySelector('.heart-btn');
    btn.textContent = '¡TE AMO! ❤️';
}

// Prevenir scroll global
document.addEventListener('touchmove', (e) => {
    if (piezaSeleccionada) {
        e.preventDefault();
    }
}, { passive: false });

window.onload = inicializarPuzzle;