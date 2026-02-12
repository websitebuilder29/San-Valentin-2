// Configuración
const RUTA_FOTO = "1.jpg";
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

// Toast para móvil
function mostrarToast(mensaje) {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = mensaje;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Cortar la imagen en 9 piezas
function cortarImagen() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = RUTA_FOTO + '?t=' + new Date().getTime();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
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
        
        img.onerror = function() {
            reject('Error al cargar la imagen');
        };
    });
}

// Mostrar frase de amor aleatoria
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

// ========== SISTEMA DE ARRASTRE TÁCTIL MANUAL ==========
function iniciarArrastre(e, piezaElement, pieceId) {
    e.preventDefault();
    
    // Si la pieza ya fue colocada, no hacer nada
    if (piezaElement.classList.contains('placed')) {
        return;
    }
    
    piezaSeleccionada = pieceId;
    piezaOriginal = piezaElement;
    
    // Crear clon flotante
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
    
    // Posición inicial
    let touch = e.touches ? e.touches[0] : e;
    touchOffsetX = touch.clientX - piezaElement.getBoundingClientRect().left;
    touchOffsetY = touch.clientY - piezaElement.getBoundingClientRect().top;
    
    clon.style.left = (touch.clientX - touchOffsetX) + 'px';
    clon.style.top = (touch.clientY - touchOffsetY) + 'px';
    
    // Ocultar pieza original
    piezaElement.style.opacity = '0.3';
    
    // Resaltar espacios vacíos
    document.querySelectorAll('.empty-slot').forEach(slot => {
        slot.style.border = '3px dashed #ff3b6f';
        slot.style.backgroundColor = 'rgba(255, 107, 139, 0.1)';
    });
}

function moverArrastre(e) {
    e.preventDefault();
    
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
    
    if (!piezaSeleccionada || !piezaOriginal) return;
    
    // Remover clon flotante
    const clon = document.getElementById('pieza-flotante');
    if (clon) clon.remove();
    
    // Restaurar pieza original
    piezaOriginal.style.opacity = '1';
    
    // Quitar resaltado de espacios
    document.querySelectorAll('.empty-slot').forEach(slot => {
        slot.style.border = '2px dashed #ff99aa';
        slot.style.backgroundColor = 'rgba(255, 220, 230, 0.7)';
    });
    
    // Encontrar sobre qué elemento se soltó
    let touch = e.changedTouches ? e.changedTouches[0] : e;
    let elementoDebajo = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Buscar si es un espacio vacío o está dentro de uno
    let slotEncontrado = null;
    while (elementoDebajo) {
        if (elementoDebajo.classList && elementoDebajo.classList.contains('empty-slot')) {
            slotEncontrado = elementoDebajo;
            break;
        }
        if (elementoDebajo.classList && elementoDebajo.classList.contains('piece-placed')) {
            break;
        }
        elementoDebajo = elementoDebajo.parentElement;
    }
    
    // Si soltó en un espacio vacío
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
        
        // Prevenir comportamientos por defecto en móvil
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
            
            // ===== EVENTOS TÁCTILES (MÓVIL) =====
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
            
            // ===== EVENTOS DE MOUSE (PC) =====
            pieceDiv.addEventListener('mousedown', (e) => {
                e.preventDefault();
                iniciarArrastre(e, pieceDiv, pieza.id);
            });
            
            pieceDiv.addEventListener('mousemove', (e) => {
                e.preventDefault();
                moverArrastre(e);
            });
            
            pieceDiv.addEventListener('mouseup', (e) => {
                e.preventDefault();
                terminarArrastre(e);
            });
            
            piecesContainer.appendChild(pieceDiv);
        });
        
        actualizarContador();
        
    } catch (error) {
        console.error('Error:', error);
        piecesContainer.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">❌ No encontré la foto "1.jpg".<br><br>📸 Asegúrate de que esté en la misma carpeta.</p>';
    }
}

// Colocar pieza
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

// Actualizar contador
function actualizarContador() {
    const colocadas = piezasColocadas.filter(p => p).length;
    document.getElementById('piecesPlaced').textContent = colocadas;
    document.getElementById('progressFill').style.width = (colocadas / 9 * 100) + '%';
}

// Completar puzzle
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

// Reiniciar
function reiniciarPuzzle() {
    inicializarPuzzle();
    confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#ffd3b6']
    });
}

// Celebrar
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

// Prevenir scroll mientras arrastra
document.addEventListener('touchmove', (e) => {
    if (piezaSeleccionada) {
        e.preventDefault();
    }
}, { passive: false });

window.onload = inicializarPuzzle;