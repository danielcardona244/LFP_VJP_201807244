import { Token, TokenType } from "../Analyzer/Tokens";

// Estructura auxiliar para representar un curso
interface Curso {
    codigo: string;
    nombre: string;
    creditos: number;
    prerrequisitos: string[];
}

interface Semestre {
    numero: string;
    cursos: Curso[];
}

interface Carrera {
    nombre: string;
    semestres: Semestre[];
}

export function generarHTMLPensum(tokens: Token[]): string {
    let index = 0;

    const carrera: Carrera = {
        nombre: "",
        semestres: []
    };

    function match(expected: string): boolean {
        return tokens[index] && tokens[index].lexeme === expected;
    }

    function next(): Token {
        return tokens[index++];
    }

    function parseCarrera() {
        next(); // 'Carrera'
        next(); // ':'
        while (tokens[index].type === TokenType.STRING) {
            carrera.nombre += tokens[index++].lexeme + " ";
        }
        carrera.nombre = carrera.nombre.trim();
        next(); // '{'
        while (match("Semestre")) parseSemestre();
    }

    function parseSemestre() {
        next(); // 'Semestre'
        next(); // ':'
        const numero = next().lexeme;
        next(); // '{'
        const semestre: Semestre = { numero, cursos: [] };
        while (match("Curso")) {
            semestre.cursos.push(parseCurso());
        }
        carrera.semestres.push(semestre);
        next(); // '}'
    }

    function parseCurso(): Curso {
        next(); // 'Curso'
        next(); // '{'
        let codigo = "", nombre = "", creditos = 0, prerrequisitos: string[] = [];

        while (!match("}")) {
            const atributo = next().lexeme;
            next(); // ':'
            switch (atributo) {
                case "Codigo":
                    codigo = next().lexeme;
                    break;
                case "Nombre":
                    nombre = next().lexeme.replace(/"/g, '');
                    break;
                case "Creditos":
                    creditos = parseInt(next().lexeme);
                    break;
                case "Prerrequisitos":
                    next(); // '['
                    while (!match("]")) {
                        const cod = next().lexeme;
                        prerrequisitos.push(cod);
                        if (match(",")) next();
                    }
                    next(); // ']'
                    break;
            }
        }
        next(); // '}'
        return { codigo, nombre, creditos, prerrequisitos };
    }

    parseCarrera();

    return generarHTML(carrera);
}

// -------------------------------
// Función que genera el HTML
// -------------------------------
function generarHTML(carrera: Carrera): string {
    const script = `
    <script>
    function seleccionarCurso(codigo) {
        const todos = document.querySelectorAll('.curso');
        todos.forEach(c => c.classList.remove('activo'));

        function resaltar(cod) {
            const el = document.getElementById('curso-' + cod);
            if (el) {
                el.classList.add('activo');
                const prereqs = el.dataset.prereqs.split(',');
                prereqs.filter(p => p).forEach(resaltar);
            }
        }

        resaltar(codigo);
    }
    </script>`;

    const style = `
    <style>
    .curso { border: 1px solid #ccc; padding: 8px; margin: 6px; border-radius: 4px; cursor: pointer; }
    .activo { background-color: gold; }
    .semestre { margin-bottom: 20px; }
    </style>`;

    let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${carrera.nombre}</title>${style}${script}</head><body>`;
    html += `<h1>${carrera.nombre}</h1>`;

    carrera.semestres.forEach(s => {
        html += `<div class="semestre"><h2>Semestre ${s.numero}</h2>`;
        s.cursos.forEach(c => {
            html += `<div class="curso" id="curso-${c.codigo}" data-prereqs="${c.prerrequisitos.join(',')}" onclick="seleccionarCurso('${c.codigo}')">
                        <strong>${c.nombre}</strong><br>
                        Código: ${c.codigo} | Créditos: ${c.creditos}
                    </div>`;
        });
        html += `</div>`;
    });

    html += `</body></html>`;
    return html;
}
