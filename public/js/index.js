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

function limpiarEditor() {
    document.getElementById('editor').innerText = '';
}

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

function guardarArchivo() {
    const contenido = document.getElementById('editor').innerText;
    const blob = new Blob([contenido], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'archivo.pklfp';
    a.click();
}

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

function procesarAnalisis(data, contenido) {
    mostrarErrores(data.errors);
    mostrarTokens(data.tokens);
    if (data.errors && data.errors.length > 0) {
        document.getElementById('editor').innerText = contenido; // Limpia el resaltado
        alert("Se encontraron errores léxicos. Revisa la tabla de errores.");
    } else {
        resaltarTokens(data.tokens, contenido);
        alert("Análisis completado. Revisa el resaltado en el editor y la tabla de tokens.");
    }
}

function resaltarTokens(tokens, originalText) {
    let html = '';
    let pos = 0;

    tokens.forEach(token => {
        // Calcula la posición real del token en el texto plano
        const start = originalText.indexOf(token.lexema, pos);
        if (start === -1) return; // No encontrado, ignora
        const end = start + token.lexema.length;

        // Agrega el texto anterior sin formato
        html += escapeHtml(originalText.slice(pos, start));

        // Determina el color según el tipo de token
        let color = 'black';
        switch(token.tipo) {
            case 4: color = 'blue'; break;      // Palabras reservadas
            case 7: color = 'orange'; break;    // Cadenas
            case 6: color = 'purple'; break;    // Números
            case 2: case 3: case 9: case 10: case 0: case 1:
                color = 'black'; break;         // Símbolos
        }

        // Agrega el token resaltado
        html += `<span style="color:${color}; font-weight:bold;">${escapeHtml(token.lexema)}</span>`;
        pos = end;
    });

    // Agrega el resto del texto
    html += escapeHtml(originalText.slice(pos));

    document.getElementById('editor').innerHTML = html;
}

// Función para escapar caracteres HTML especiales
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



