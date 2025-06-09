// Carga los sprites de los Pokémon usando la PokéAPI al cargar la página de equipos
document.addEventListener('DOMContentLoaded', () => {
    const getPokemon = async (name, img) => {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        let result = await response.json();
        let sprite = result.sprites.other['official-artwork'].front_default;
        img.setAttribute('src', sprite);
    }
    const imagenes = document.getElementsByTagName('img');
    for (let i = 0; i < imagenes.length; i++) {
        let pokemon = imagenes[i].getAttribute('id');
        getPokemon(pokemon, imagenes[i]);
    }
});

// Diccionario para mostrar el nombre del token
const TypeNames = [
    "PAR_OPEN", "PAR_CLOSE", "SEMICOLON", "EQUAL", "RESERVED_WORD", "TYPE", "NUMBER", "STRING", "ID",
    "COLON", "COMMA", "ASSIGN", "BRACKET_OPEN", "BRACKET_CLOSE", "BRACE_OPEN", "BRACE_CLOSE", "UNKNOW"
];

// Limpia el editor de texto
function limpiarEditor() {
    document.getElementById('editor').innerText = '';
}

// Carga el contenido de un archivo al editor
function cargarArchivo() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Selecciona un archivo .pklfp");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        const contenido = e.target.result;
        document.getElementById('editor').innerText = contenido;
    };
    reader.readAsText(file);
}

// Guarda el contenido actual del editor como archivo .pklfp
function guardarArchivo() {
    const contenido = document.getElementById('editor').innerText;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'archivo.pklfp';
    a.click();
}

// Envía el contenido del editor al backend para análisis léxico
function analizar() {
    const contenido = document.getElementById('editor').innerText;
    fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: contenido })
    })
    .then(res => res.json())
    .then(data => {
        procesarAnalisis(data, contenido);
    });
}

// Procesa la respuesta del backend: muestra tokens y errores, resalta si no hay errores
function procesarAnalisis(data, contenido) {
    mostrarErrores(data.errors);
    mostrarTokens(data.tokens);
    if (data.errors && data.errors.length > 0) {
        document.getElementById('editor').innerText = contenido;
        mostrarAviso("Se encontraron errores léxicos. Revisa la tabla de errores.", "#d32f2f");
    } else {
        resaltarTokens(data.tokens, contenido);
        mostrarAviso("Análisis completado. Revisa el resaltado en el editor y la tabla de tokens.", "#43a047");
    }
}

// Resalta los tokens en el editor usando colores según el tipo
function resaltarTokens(tokens, originalText) {
    let html = '';
    let pos = 0;

    tokens.forEach(token => {
        const start = originalText.indexOf(token.lexema, pos);
        if (start === -1) return;
        const end = start + token.lexema.length;
        html += escapeHtml(originalText.slice(pos, start));
        let color = 'black';
        switch(token.tipo) {
            case 4: color = 'blue'; break;      // Palabras reservadas
            case 7: color = 'orange'; break;    // Cadenas
            case 6: color = 'purple'; break;    // Números
            default: color = 'black'; break;
        }
        html += `<span style="color:${color}; font-weight:bold;">${escapeHtml(token.lexema)}</span>`;
        pos = end;
    });
    html += escapeHtml(originalText.slice(pos));
    document.getElementById('editor').innerHTML = html;
}

// Escapa caracteres HTML especiales para evitar problemas de inyección
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

// Muestra la tabla de tokens reconocidos
function mostrarTokens(tokens) {
    const tbody = document.querySelector('#tablaTokens tbody');
    tbody.innerHTML = '';
    tokens.forEach((token, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${token.fila ?? token.row}</td>
            <td>${token.columna ?? token.column}</td>
            <td>${token.lexema}</td>
            <td>${TypeNames[token.tipo]}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Muestra la tabla de errores léxicos
function mostrarErrores(errors) {
    const tbody = document.querySelector('#tablaErrores tbody');
    tbody.innerHTML = '';
    errors.forEach((error, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${error.fila ?? error.row}</td>
            <td>${error.columna ?? error.column}</td>
            <td>${error.lexema ?? error.caracter}</td>
            <td>${error.descripcion ?? "Error léxico"}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Envía el contenido del editor al backend para mostrar los equipos en una nueva pestaña
function verEquipos() {
    const contenido = document.getElementById('editor').innerText;
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/team';
    form.target = '_blank';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'input';
    input.value = contenido;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

// Muestra un aviso flotante estilizado
function mostrarAviso(mensaje, color="#1976d2") {
    const aviso = document.getElementById('aviso');
    aviso.innerText = mensaje;
    aviso.style.background = color;
    aviso.style.display = 'block';
    aviso.style.opacity = '1';
    setTimeout(() => {
        aviso.style.opacity = '0';
        setTimeout(() => aviso.style.display = 'none', 300);
    }, 2500);
}



