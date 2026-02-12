// Configuración
const RUTA_FOTO = "1.jpg";
let piezasColocadas = new Array(9).fill(false);
let piezasData = [];

// FRASES DE AMOR - ¡Personalízalas!
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
        img.src = RUTA_FOTO + '?t=' + new Date().getTime(); // Cache busting
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Hacer la imagen cuadrada para mejor experiencia
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
    
    // Animación
    const loveMessage = document.querySelector('.love-message');
    loveMessage.style.animation = 'none';
    loveMessage.offsetHeight;
    loveMessage.style.animation = 'heartbeat 1s ease';
    
    // También mostrar toast en móvil
    if (window.innerWidth <= 900) {
        mostrarToast(fraseAleatoria);
    }
}

// Inicializar juego
async function inicializarPuzzle() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    const piecesContainer = document.getElementById('piecesContainer');
    
    puzzleBoard.innerHTML = '';
    piecesContainer.innerHTML = '';
    
    // Resetear estado
    piezasColocadas = new Array(9).fill(false);
    document.getElementById('finalQuestion').classList.remove('show');
    
    // Mensaje inicial
    document.getElementById('messageText').textContent = '💝 Coloca una pieza para ver un mensaje de amor';
    
    // Crear espacios vacíos en el tablero
    for (let i = 0; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'empty-slot';
        slot.dataset.position = i;
        slot.textContent = '✨';
        
        // Eventos drag & drop
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drop-zone');
        });
        
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drop-zone');
        });
        
        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drop-zone');
            
            const pieceId = e.dataTransfer.getData('text/plain');
            const position = parseInt(slot.dataset.position);
            
            colocarPieza(pieceId, position, slot);
        });
        
        // Para móvil: toque largo o doble toque
        slot.addEventListener('touchstart', (e) => {
            // Prevenir scroll
            e.preventDefault();
        });
        
        puzzleBoard.appendChild(slot);
    }
    
    try {
        // Cortar la imagen
        piezasData = await cortarImagen();
        
        // Mezclar piezas
        const piezasMezcladas = [...piezasData].sort(() => Math.random() - 0.5);
        
        // Crear las piezas arrastrables
        piezasMezcladas.forEach((pieza) => {
            const pieceDiv = document.createElement('div');
            pieceDiv.className = 'puzzle-piece';
            pieceDiv.draggable = true;
            pieceDiv.dataset.pieceId = pieza.id;
            pieceDiv.dataset.position = pieza.position;
            
            const img = document.createElement('img');
            img.src = pieza.dataUrl;
            img.alt = `Pieza ${pieza.id}`;
            
            pieceDiv.appendChild(img);
            
            // Eventos de drag
            pieceDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', pieza.id);
                pieceDiv.classList.add('dragging');
            });
            
            pieceDiv.addEventListener('dragend', () => {
                pieceDiv.classList.remove('dragging');
            });
            
            // Para móvil: mejor soporte táctil
            pieceDiv.addEventListener('touchstart', (e) => {
                e.preventDefault();
                // Guardar referencia para el drop
                window.draggedPiece = {
                    id: pieza.id,
                    element: pieceDiv
                };
                pieceDiv.classList.add('dragging');
            });
            
            pieceDiv.addEventListener('touchmove', (e) => {
                e.preventDefault();
            });
            
            pieceDiv.addEventListener('touchend', (e) => {
                pieceDiv.classList.remove('dragging');
            });
            
            piecesContainer.appendChild(pieceDiv);
        });
        
        actualizarContador();
        
    } catch (error) {
        console.error('Error:', error);
        piecesContainer.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">❌ No encontré la foto "1.jpg".<br><br>📸 Asegúrate de que esté en la misma carpeta.</p>';
    }
}

// Colocar pieza en el tablero
function colocarPieza(pieceId, position, slotElement) {
    // Verificar si ya hay una pieza en esa posición
    if (piezasColocadas[position]) {
        if (window.innerWidth <= 900) {
            mostrarToast('💝 Esta posición ya tiene una pieza');
        } else {
            alert('💝 Esta posición ya tiene una pieza');
        }
        return;
    }
    
    // Buscar la pieza en el contenedor de piezas disponibles
    const piezaElement = document.querySelector(`[data-piece-id="${pieceId}"]`);
    
    if (!piezaElement) {
        if (window.innerWidth <= 900) {
            mostrarToast('💝 Esta pieza ya fue colocada');
        } else {
            alert('💝 Esta pieza ya fue colocada');
        }
        return;
    }
    
    // Buscar los datos de la pieza
    const piezaData = piezasData.find(p => p.id == pieceId);
    
    // Verificar que la pieza corresponda a esta posición
    if (piezaData.position !== position) {
        if (window.innerWidth <= 900) {
            mostrarToast('✨ Esta pieza no va aquí, mira la foto completa');
        } else {
            alert(`✨ Esta pieza no va aquí. Mira la foto completa para saber dónde va.`);
        }
        return;
    }
    
    // Marcar como colocada
    piezasColocadas[position] = true;
    
    // Crear la pieza colocada
    const piecePlaced = document.createElement('div');
    piecePlaced.className = 'piece-placed';
    
    const img = document.createElement('img');
    img.src = piezaData.dataUrl;
    img.alt = `Pieza ${piezaData.id}`;
    
    piecePlaced.appendChild(img);
    
    // Reemplazar el slot vacío con la pieza colocada
    slotElement.innerHTML = '';
    slotElement.className = 'piece-placed';
    slotElement.appendChild(img);
    slotElement.dataset.position = position;
    
    // Eliminar la pieza del contenedor de disponibles
    piezaElement.remove();
    
    // MOSTRAR FRASE DE AMOR 🎉
    mostrarFraseAmor();
    
    // Vibración en móvil
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Mini confeti por pieza colocada
    confetti({
        particleCount: 10,
        spread: 30,
        origin: { y: 0.7 },
        colors: ['#ff6b8b', '#ff99aa']
    });
    
    actualizarContador();
    
    // Verificar si completó
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
    
    // Mostrar frase especial al completar
    document.getElementById('messageText').textContent = '💖 ¡COMPLETASTE EL ROMPECABEZAS! 💖 Eres la pieza que faltaba en mi vida.';
    
    // Confeti grande
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
    // Confeti masivo
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
    
    // Mensaje final
    setTimeout(() => {
        if (window.innerWidth <= 900) {
            mostrarToast('💖 ¡TE AMO! 💖 Gracias por ser mi San Valentín');
        } else {
            alert('💖 ¡SÍ ACEPTO! 💖\n\nGracias por ser mi San Valentín. Te amo muchísimo.');
        }
    }, 500);
    
    const btn = document.querySelector('.heart-btn');
    btn.textContent = '¡TE AMO! ❤️';
}

// Soporte para móvil - Drag & Drop táctil
document.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('puzzle-piece')) {
        e.preventDefault();
    }
}, { passive: false });

// Iniciar cuando cargue
window.onload = inicializarPuzzle;