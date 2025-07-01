function loadFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('editor').value = e.target.result;
    };
    reader.readAsText(fileInput.files[0]);
}

function analyze() {
    const code = document.getElementById('editor').value;
    fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: code
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('tsOutput').value = data.translation || '';
        // Mostrar solo los textos de Console.WriteLine en la consola
        let consoleLines = '';
        if (data.tokens) {
            for (let i = 0; i < data.tokens.length; i++) {
                if (data.tokens[i].type === 'R_CONSOLE' && data.tokens[i+2]?.type === 'R_WRITELINE') {
                    // Busca el string dentro de los paréntesis
                    let j = i+3;
                    let str = '';
                    while (data.tokens[j] && data.tokens[j].type !== 'SEMICOLON') {
                        str += data.tokens[j].lexeme;
                        j++;
                    }
                    // Limpia comillas y concatena
                    str = str.replace(/^[\(\s"]+|[\)\s"]+$/g, '');
                    consoleLines += str + '\n';
                }
            }
        }
        document.getElementById('consoleOutput').value = consoleLines.trim();

        // Guarda los reportes HTML en variables globales
        window.reports = {
            tokens: data.tokensHTML || '',
            lexicalErrors: data.lexicalErrorsHTML || '',
            syntaxErrors: data.syntaxErrorsHTML || '',
            symbols: data.symbolTableHTML || ''
        };
        // Oculta el reporte al analizar
        document.getElementById('report').style.display = 'none';
    });
}

function showReport(type) {
    document.getElementById('report').innerHTML = window.reports[type] || '<i>No hay datos</i>';
    document.getElementById('report').style.display = 'block';
}

function clearAll() {
    document.getElementById('editor').value = '';
    document.getElementById('tsOutput').value = '';
    document.getElementById('consoleOutput').value = '';
    document.getElementById('report').innerHTML = '';
    document.getElementById('report').style.display = 'none';
    window.reports = {};
}