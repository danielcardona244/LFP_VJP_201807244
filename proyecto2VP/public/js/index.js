function loadFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('editor').value = e.target.result;
    };
    reader.readAsText(fileInput.files[0]);
}

let lastCode = ""; // Guarda el código actual para reanalizar si el usuario da "Continuar"

function analyze(force = false) {
    const code = document.getElementById('editor').value;
    lastCode = code;
    fetch('/analyze' + (force ? '?force=true' : ''), {
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

        // Si hay errores léxicos y stop=true, muestra solo los errores y el botón "Continuar"
        if (data.stop) {
            showReport('lexicalErrors');
            document.getElementById('continueBtn').style.display = 'inline-block';
            document.getElementById('analyzeBtn').disabled = true;
            return; // Detiene aquí, no sigue mostrando nada más
        } else {
            document.getElementById('continueBtn').style.display = 'none';
            document.getElementById('analyzeBtn').disabled = false;
        }

        const reportDiv = document.getElementById('report');
        if (data.lexicalErrors && data.lexicalErrors.length > 0) {
            reportDiv.innerHTML = "<b>¡Error léxico detectado!</b><br>" + (data.lexicalErrorsHTML || '');
            reportDiv.style.display = 'block';
        } else if (data.syntaxErrors && data.syntaxErrors.length > 0) {
            reportDiv.innerHTML = "<b>¡Error sintáctico detectado!</b><br>" + (data.syntaxErrorsHTML || '');
            reportDiv.style.display = 'block';
        } else {
            reportDiv.innerHTML = data.symbolTableHTML || '<i>No hay tabla de símbolos</i>';
            reportDiv.style.display = 'block';
        }
    });
}

function continueAnalysis() {
    analyze(true); // Fuerza el análisis aunque haya errores léxicos
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