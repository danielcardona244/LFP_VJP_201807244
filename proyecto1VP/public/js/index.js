const editor = document.getElementById("editor");
const tableBody = document.querySelector("#tokenTable tbody");
let erroresGlobales = [];

function analizarTexto() {
    fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: editor.value })
    })
    .then(res => res.json())
    .then(data => {
        renderTokens(data.tokens);

        erroresGlobales = [...data.lexErrors, ...data.syntaxErrors];

        if (erroresGlobales.length > 0) {
            generarErroresHTML(erroresGlobales);
        } else if (data.html) {
            generarPensumHTML(data.html);
        }
    });
}

function renderTokens(tokens) {
    tableBody.innerHTML = "";
    tokens.forEach((t, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${i + 1}</td><td>${t.row}</td><td>${t.column}</td><td>${t.lexeme}</td><td>${t.type}</td>`;
        tableBody.appendChild(row);
    });
}

function abrirErrores() {
    if (erroresGlobales.length === 0) {
        alert("No hay errores.");
        return;
    }
    generarErroresHTML(erroresGlobales);
}

function generarErroresHTML(errores) {
    const html = `
    <html><head><title>Errores</title></head><body>
    <h2>Errores Encontrados</h2>
    <table border="1"><tr><th>#</th><th>Fila</th><th>Columna</th><th>Carácter</th><th>Descripción</th></tr>
    ${errores.map((e, i) =>
        `<tr><td>${i + 1}</td><td>${e.row}</td><td>${e.column}</td><td>${e.lexeme}</td><td>${e.description}</td></tr>`
    ).join("")}
    </table></body></html>`;
    abrirYDescargarArchivo("errores.html", html);
}

function generarPensumHTML(html) {
    abrirYDescargarArchivo("pensum.html", html);
}

function abrirYDescargarArchivo(nombre, contenido) {
    const blob = new Blob([contenido], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Abrir en nueva pestaña
    window.open(url, "_blank");

    // Descargar
    const link = document.createElement("a");
    link.href = url;
    link.download = nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function limpiarEditor() {
    editor.value = "";
    tableBody.innerHTML = "";
}

function guardarArchivo() {
    const blob = new Blob([editor.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "archivo.plfp";
    link.click();
}

document.getElementById("fileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => editor.value = ev.target.result;
    reader.readAsText(file);
});
