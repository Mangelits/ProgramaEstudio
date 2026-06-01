// ==========================================
// 1. ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
const AppState = {
    baseDeDatos: typeof preguntasData !== 'undefined' ? preguntasData : [],
    moduloActual: 'menu', 
    preguntaActualIndex: 0,
    examenActual: [],
    respuestasExamen: [],
    indiceExamen: 0
};

// ==========================================
// 2. INICIALIZACIÓN Y CARGA DE DATASET DINÁMICO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // EL TRUCO: Reasignamos los IDs dinámicamente al arrancar para evitar duplicados
    if (AppState.baseDeDatos.length > 0) {
        AppState.baseDeDatos = AppState.baseDeDatos.map((pregunta, index) => {
            return { ...pregunta, id: index + 1 }; // Fuerzamos un ID único (1, 2, 3...)
        });
    }

    actualizarMensajeEstado();
    
    if (!document.getElementById('modulo-container')) {
        const container = document.createElement('section');
        container.id = 'modulo-container';
        container.className = 'fade-in';
        container.style.display = 'none';
        container.style.padding = '2rem';
        container.style.maxWidth = '1000px';
        container.style.margin = '0 auto';
        container.setAttribute('aria-live', 'polite');
        
        const header = document.querySelector('.header');
        header.parentNode.insertBefore(container, header.nextSibling);
    }
});

function actualizarMensajeEstado() {
    const statusEl = document.getElementById('status-message');
    if (AppState.baseDeDatos.length > 0) {
        statusEl.textContent = `${AppState.baseDeDatos.length} preguntas cargadas y listas.`;
        statusEl.style.color = 'var(--purple-light)'; 
    } else {
        statusEl.textContent = "Sin datos. Por favor, carga un archivo JSON.";
        statusEl.style.color = 'var(--maroon-light)'; 
    }
}

// Lector de archivos JSON
function cargarNuevoDataset(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const contenido = JSON.parse(e.target.result);
            if (Array.isArray(contenido) && contenido.length > 0) {
                
                // EL TRUCO (Parte 2): Hacemos lo mismo para los JSON que subas sobre la marcha
                AppState.baseDeDatos = contenido.map((pregunta, index) => {
                    return { ...pregunta, id: index + 1 }; 
                });

                actualizarMensajeEstado();
                alert(`¡Éxito! Se han cargado y reindexado ${contenido.length} nuevas preguntas.`);
                if (AppState.moduloActual !== 'menu') volverAlMenu();
            } else {
                throw new Error("El JSON no tiene el formato de array esperado.");
            }
        } catch (error) {
            console.error(error);
            alert("Error al leer el archivo. Asegúrate de que sea un .json válido con el array de preguntas.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

// ==========================================
// 3. ENRUTADOR PRINCIPAL
// ==========================================
function iniciarModulo(modulo) {
    if (AppState.baseDeDatos.length === 0 && modulo !== 'estadisticas') {
        alert("Carga primero un archivo JSON de preguntas desde el botón superior.");
        return;
    }

    AppState.moduloActual = modulo;
    AppState.preguntaActualIndex = 0; 

    document.getElementById('main-menu').style.display = 'none';
    const container = document.getElementById('modulo-container');
    container.style.display = 'block';
    // Reiniciar animación
    container.classList.remove('fade-in');
    void container.offsetWidth; 
    container.classList.add('fade-in');
    
    switch(modulo) {
        case 'examenes': renderizarMenuExamenes(container); break;
        case 'repasar': renderizarRepaso(container); break;
        case 'estadisticas': renderizarEstadisticas(container); break;
    }
}

function volverAlMenu() {
    AppState.moduloActual = 'menu';
    document.getElementById('modulo-container').style.display = 'none';
    document.getElementById('modulo-container').innerHTML = ''; 
    const menu = document.getElementById('main-menu');
    menu.style.display = 'flex'; 
    menu.classList.remove('fade-in');
    void menu.offsetWidth;
    menu.classList.add('fade-in');
}

// ==========================================
// 4. MÓDULO: REPASAR
// ==========================================
function renderizarRepaso(container) {
    const pregunta = AppState.baseDeDatos[AppState.preguntaActualIndex];
    
    let opcionesHTML = '';
    for (const [letra, texto] of Object.entries(pregunta.opciones)) {
        opcionesHTML += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); transition: background 0.2s;">
                <input type="radio" id="opcion-${letra}" name="pregunta-repaso" value="${letra}" style="margin-right: 10px; transform: scale(1.2); accent-color: var(--purple-light);">
                <label for="opcion-${letra}" style="cursor: pointer; display: inline-block; width: 90%;">
                    <strong style="color: var(--purple-light);">${letra.toUpperCase()})</strong> ${texto}
                </label>
            </div>
        `;
    }

    const contextoHTML = pregunta.contexto 
        ? `<div style="background: rgba(108, 52, 131, 0.1); padding: 1.5rem; border-left: 4px solid var(--purple-light); margin-bottom: 2rem; border-radius: 4px; font-size: 0.95rem;">
            <strong style="color: var(--purple-light);">Contexto:</strong><br><br>${pregunta.contexto.replace(/\n/g, '<br>')}
           </div>` 
        : '';

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Modo Repaso: <span style="color: var(--purple-light); font-size: 1.2rem;">${pregunta.tema || 'Test'}</span></h2>
            <button onclick="volverAlMenu()" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid var(--text-muted); border-radius: 6px; cursor: pointer;">Volver al Menú</button>
        </div>

        <div style="background: var(--panel-bg); padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom: 1.5rem; font-weight: 600; color: var(--purple-light);">
                Pregunta ${AppState.preguntaActualIndex + 1} de ${AppState.baseDeDatos.length}
            </div>
            
            ${contextoHTML}
            <h3 style="margin-bottom: 2rem; line-height: 1.5; font-size: 1.3rem;">${pregunta.pregunta}</h3>
            
            <fieldset style="border: none; padding: 0; margin-bottom: 2rem;">
                ${opcionesHTML}
            </fieldset>
            
            <div id="feedback-area" style="margin-bottom: 2rem;"></div>

            <div style="display: flex; gap: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
                <button onclick="comprobarRespuesta('${pregunta.respuesta_correcta}')" style="background: var(--purple); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s;" onmouseover="this.style.boxShadow='0 0 15px var(--glow-purple)'" onmouseout="this.style.boxShadow='none'">Comprobar Respuesta</button>
                <button onclick="siguientePreguntaRepaso()" style="background: #2c3e50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600;">Siguiente Pregunta ➡️</button>
            </div>
        </div>
    `;
}

function comprobarRespuesta(correcta) {
    const seleccionada = document.querySelector('input[name="pregunta-repaso"]:checked');
    const feedbackArea = document.getElementById('feedback-area');
    const pregunta = AppState.baseDeDatos[AppState.preguntaActualIndex];
    
    if (!seleccionada) {
        feedbackArea.innerHTML = `<p style="color: #e74c3c; font-weight: bold;">⚠️ Selecciona una opción.</p>`;
        return;
    }

    const radios = document.querySelectorAll('input[name="pregunta-repaso"]');
    radios.forEach(r => r.disabled = true);

    if (seleccionada.value === correcta) {
        feedbackArea.innerHTML = `
            <div class="fade-in" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; padding: 1.5rem; border-radius: 8px; border-left: 5px solid #2ecc71;">
                <h4 style="margin-bottom: 0.5rem;">✅ ¡Correcto!</h4>
                <p style="color: #fff;">${pregunta.explicacion}</p>
            </div>`;
    } else {
        feedbackArea.innerHTML = `
            <div class="fade-in" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c; padding: 1.5rem; border-radius: 8px; border-left: 5px solid #e74c3c;">
                <h4 style="margin-bottom: 0.5rem;">❌ Incorrecto</h4>
                <p style="color: #fff; margin-bottom: 0.5rem;">La correcta era la <strong style="color: #e74c3c;">${correcta.toUpperCase()}</strong>.</p>
                <p style="color: #fff;"><strong>Explicación:</strong> ${pregunta.explicacion}</p>
            </div>`;
    }
}

function siguientePreguntaRepaso() {
    if (AppState.preguntaActualIndex < AppState.baseDeDatos.length - 1) {
        AppState.preguntaActualIndex++;
        renderizarRepaso(document.getElementById('modulo-container'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        alert("¡Has terminado todas las preguntas!");
        volverAlMenu();
    }
}

// ==========================================
// 5. MÓDULO: EXÁMENES
// ==========================================
function renderizarMenuExamenes(container) {
    const total = AppState.baseDeDatos.length;
    const maxRapido = Math.min(60, total);
    const sliderStart = Math.max(1, Math.floor(total / 2));

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Configuración del Examen</h2>
            <button onclick="volverAlMenu()" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid var(--text-muted); border-radius: 6px; cursor: pointer;">Volver al Menú</button>
        </div>

        <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
            <button class="panel panel-exam" style="flex: 1; min-width: 250px; padding: 2rem;" onclick="prepararTest(${total})">
                <div class="panel-icon">💯</div>
                <h3 style="color: var(--text-main);">Examen Completo</h3>
                <p style="color: var(--text-muted);">Simulación con todas las preguntas (${total}).</p>
            </button>

            <div class="panel panel-exam" style="flex: 1; min-width: 250px; padding: 2rem; cursor: default; border-color: rgba(255,255,255,0.05);">
                <div class="panel-icon">⚙️</div>
                <h3 style="color: var(--text-main);">Personalizado</h3>
                <label for="slider-preguntas" style="display: block; margin-bottom: 1rem; color: var(--text-muted);">Elige la cantidad:</label>
                <input type="range" id="slider-preguntas" min="1" max="${total}" value="${sliderStart}" 
                       style="width: 80%; margin-bottom: 1rem; cursor: pointer; accent-color: var(--maroon-light);" 
                       oninput="document.getElementById('slider-val').innerText = this.value">
                <p style="font-weight: 600; font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--maroon-light);">
                    <span id="slider-val">${sliderStart}</span> preguntas
                </p>
                <button onclick="prepararTest(document.getElementById('slider-preguntas').value)" 
                        style="background: var(--maroon-light); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; width: 80%; transition: 0.3s;" onmouseover="this.style.boxShadow='0 0 15px var(--glow-maroon)'" onmouseout="this.style.boxShadow='none'">
                    Comenzar
                </button>
            </div>

            <button class="panel panel-exam" style="flex: 1; min-width: 250px; padding: 2rem;" onclick="prepararTest(${maxRapido})">
                <div class="panel-icon">⚡</div>
                <h3 style="color: var(--text-main);">Examen Rápido</h3>
                <p style="color: var(--text-muted);">Simulación directa de ${maxRapido} preguntas.</p>
            </button>
        </div>
    `;
}

function prepararTest(cantidad) {
    const num = parseInt(cantidad, 10);
    let arrayBarajado = [...AppState.baseDeDatos].sort(() => Math.random() - 0.5);
    AppState.examenActual = arrayBarajado.slice(0, num);
    AppState.respuestasExamen = new Array(num).fill(null);
    AppState.indiceExamen = 0;
    renderizarPreguntaExamen();
}

function renderizarPreguntaExamen() {
    const container = document.getElementById('modulo-container');
    const pregunta = AppState.examenActual[AppState.indiceExamen];
    const respuestaGuardada = AppState.respuestasExamen[AppState.indiceExamen];
    
    let opcionesHTML = '';
    for (const [letra, texto] of Object.entries(pregunta.opciones)) {
        const estaMarcado = respuestaGuardada === letra ? 'checked' : '';
        opcionesHTML += `
            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                <input type="radio" id="exam-op-${letra}" name="pregunta-examen" value="${letra}" ${estaMarcado} onchange="guardarRespuestaTemporal('${letra}')" style="margin-right: 10px; transform: scale(1.2); accent-color: var(--maroon-light);">
                <label for="exam-op-${letra}" style="cursor: pointer; display: inline-block; width: 90%;">
                    <strong style="color: var(--maroon-light);">${letra.toUpperCase()})</strong> ${texto}
                </label>
            </div>
        `;
    }

    const contextoHTML = pregunta.contexto 
        ? `<div style="background: rgba(163, 21, 21, 0.1); padding: 1.5rem; border-left: 4px solid var(--maroon-light); margin-bottom: 2rem; border-radius: 4px; font-size: 0.95rem;">
            <strong style="color: var(--maroon-light);">Contexto:</strong><br><br>${pregunta.contexto.replace(/\n/g, '<br>')}
           </div>` 
        : '';

    container.innerHTML = `
        <div class="fade-in" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Simulación de Examen</h2>
            <button onclick="entregarExamen()" style="background: var(--maroon-light); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s;" onmouseover="this.style.boxShadow='0 0 15px var(--glow-maroon)'" onmouseout="this.style.boxShadow='none'">Entregar Examen</button>
        </div>

        <div class="fade-in" style="background: var(--panel-bg); padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom: 1.5rem; font-weight: 600; color: var(--maroon-light);">
                Pregunta ${AppState.indiceExamen + 1} de ${AppState.examenActual.length}
            </div>
            
            ${contextoHTML}
            <h3 style="margin-bottom: 2rem; line-height: 1.5; font-size: 1.3rem;">${pregunta.pregunta}</h3>
            
            <fieldset style="border: none; padding: 0; margin-bottom: 2rem;">
                ${opcionesHTML}
            </fieldset>

            <div style="display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem;">
                <button onclick="navegarExamen(-1)" ${AppState.indiceExamen === 0 ? 'disabled' : ''} style="background: #2c3e50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; opacity: ${AppState.indiceExamen === 0 ? '0.5' : '1'};">⬅️ Anterior</button>
                <button onclick="navegarExamen(1)" ${AppState.indiceExamen === AppState.examenActual.length - 1 ? 'disabled' : ''} style="background: #2c3e50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; opacity: ${AppState.indiceExamen === AppState.examenActual.length - 1 ? '0.5' : '1'};">Siguiente ➡️</button>
            </div>
        </div>
    `;
}

function guardarRespuestaTemporal(letra) { AppState.respuestasExamen[AppState.indiceExamen] = letra; }
function navegarExamen(direccion) { AppState.indiceExamen += direccion; renderizarPreguntaExamen(); }

function entregarExamen() {
    const confirmacion = confirm("¿Estás seguro de que quieres entregar el examen?");
    if (!confirmacion) return;

    let aciertos = 0, fallos = 0, blancos = 0;
    const total = AppState.examenActual.length;
    const idsPreguntas = [];
    const respuestasDelUsuario = [];

    AppState.examenActual.forEach((pregunta, index) => {
        const respuesta = AppState.respuestasExamen[index];
        idsPreguntas.push(pregunta.id);
        respuestasDelUsuario.push(respuesta);

        if (!respuesta) blancos++;
        else if (respuesta === pregunta.respuesta_correcta) aciertos++;
        else fallos++;
    });

    let puntuacionBruta = Math.max(0, aciertos - (fallos * 0.33));
    let notaBase10 = Math.round(((puntuacionBruta / total) * 10) * 100) / 100;

    const resultado = {
        id: Date.now(),
        fecha: new Date().toLocaleDateString('es-ES'),
        totalPreguntas: total,
        aciertos: aciertos,
        fallos: fallos,
        blancos: blancos,
        notaFinal: notaBase10,
        preguntasIds: idsPreguntas,
        respuestasUsuario: respuestasDelUsuario
    };

    guardarEnEstadisticas(resultado);
    renderizarResultados(resultado);
}

function guardarEnEstadisticas(resultado) {
    let historial = JSON.parse(localStorage.getItem('historialExamenes')) || [];
    historial.push(resultado);
    localStorage.setItem('historialExamenes', JSON.stringify(historial));
}

function renderizarResultados(resultado) {
    const container = document.getElementById('modulo-container');
    const colorNota = resultado.notaFinal >= 5.0 ? '#2ecc71' : '#e74c3c';
    const mensaje = resultado.notaFinal >= 5.0 ? '¡Misión Cumplida! Has superado el test.' : 'Análisis completado. Toca repasar más.';

    container.innerHTML = `
        <div class="fade-in" style="background: var(--panel-bg); padding: 3rem; border-radius: 12px; text-align: center; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">
            <h2 style="margin-bottom: 0.5rem; color: #fff;">Resultados del Examen</h2>
            <p style="color: var(--text-muted); margin-bottom: 2rem;">${resultado.fecha}</p>

            <div style="margin-bottom: 2.5rem;">
                <span style="display: block; font-size: 1.2rem; color: var(--text-muted); margin-bottom: 0.5rem;">Tu Nota (sobre 10)</span>
                <span style="font-size: 6rem; font-weight: 800; color: ${colorNota}; line-height: 1; text-shadow: 0 0 20px ${colorNota}40;">${resultado.notaFinal.toFixed(2)}</span>
                <p style="margin-top: 1rem; font-weight: 600; color: ${colorNota};">${mensaje}</p>
            </div>

            <div style="display: flex; justify-content: space-around; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px; margin-bottom: 2.5rem; border: 1px solid rgba(255,255,255,0.05);">
                <div><span style="font-size: 2rem; font-weight: bold; color: #2ecc71;">${resultado.aciertos}</span><span style="display: block; font-size: 0.9rem; color: var(--text-muted);">Aciertos</span></div>
                <div><span style="font-size: 2rem; font-weight: bold; color: #e74c3c;">${resultado.fallos}</span><span style="display: block; font-size: 0.9rem; color: var(--text-muted);">Fallos</span></div>
                <div><span style="font-size: 2rem; font-weight: bold; color: #95a5a6;">${resultado.blancos}</span><span style="display: block; font-size: 0.9rem; color: var(--text-muted);">Blancos</span></div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="verDetalleTest(${resultado.id})" style="background: var(--maroon-light); color: white; border: none; padding: 1rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s;" onmouseover="this.style.boxShadow='0 0 15px var(--glow-maroon)'" onmouseout="this.style.boxShadow='none'">
                    🔍 Revisar mis respuestas
                </button>
                <button onclick="volverAlMenu()" style="background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 1rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; transition: 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
                    Volver al Inicio
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// 6. MÓDULO: ESTADÍSTICAS Y BORRADO
// ==========================================
function borrarHistorial() {
    if(confirm("⚠️ ¿Peligro inminente! ¿Estás totalmente seguro de borrar TODO el historial de exámenes? Esta acción es irreversible.")) {
        localStorage.removeItem('historialExamenes');
        renderizarEstadisticas(document.getElementById('modulo-container'));
    }
}

function renderizarEstadisticas(container) {
    const historial = JSON.parse(localStorage.getItem('historialExamenes')) || [];
    
    if (historial.length === 0) {
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Centro de Mando</h2>
                <button onclick="volverAlMenu()" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid var(--text-muted); border-radius: 6px; cursor: pointer;">Volver al Menú</button>
            </div>
            <div class="fade-in" style="background: var(--panel-bg); padding: 4rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size: 4rem; display: block; margin-bottom: 1rem; opacity: 0.5;">📡</span>
                <h3 style="color: var(--text-main);">Sensores desconectados</h3>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Realiza al menos un simulacro para recopilar telemetría.</p>
            </div>
        `;
        return;
    }

    const totalSimulacros = historial.length;
    let sumaNotas = 0, totalAciertos = 0, totalPreguntasRespondidas = 0;
    
    historial.forEach(ex => {
        sumaNotas += ex.notaFinal;
        totalAciertos += ex.aciertos;
        totalPreguntasRespondidas += ex.totalPreguntas;
    });

    const notaMedia = (sumaNotas / totalSimulacros).toFixed(2);
    const tasaAcierto = Math.round((totalAciertos / totalPreguntasRespondidas) * 100);
    const colorNotaMedia = notaMedia >= 5.0 ? '#2ecc71' : '#e74c3c';

    let filasTabla = '';
    [...historial].reverse().slice(0, 5).forEach((ex, index) => {
        filasTabla += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: background 0.2s;" 
                onclick="verDetalleTest(${ex.id})" 
                onmouseover="this.style.backgroundColor='rgba(155, 89, 182, 0.15)'" 
                onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 1.2rem; color: var(--purple-light);">Test #${totalSimulacros - index} <span style="font-size: 0.8em;">🔍</span></td>
                <td style="padding: 1.2rem; color: var(--text-muted);">${ex.fecha}</td>
                <td style="padding: 1.2rem; color: #f1c40f;">${ex.aciertos} / ${ex.totalPreguntas}</td>
                <td style="padding: 1.2rem; font-weight: bold; font-size: 1.1em; color: ${ex.notaFinal >= 5 ? '#2ecc71' : '#e74c3c'};">${ex.notaFinal.toFixed(2)}</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <style>
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 1.5rem;
                padding: 0;
                color: #ffffff;
            }
            .widget {
                background: var(--panel-bg);
                border: 1px solid rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                transition: transform 0.3s;
            }
            .widget:hover { transform: translateY(-5px); }
            .widget-title {
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--text-muted);
                margin-bottom: 0.5rem;
            }
            .widget-value {
                font-size: 2.8rem;
                font-weight: 800;
                line-height: 1;
            }
            .widget-chart { grid-column: span 3; }
            .widget-history { grid-column: span 4; overflow-x: auto; }
            
            @media (max-width: 900px) {
                .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
                .widget-chart { grid-column: span 2; }
                .widget-history { grid-column: span 2; }
            }
            @media (max-width: 600px) {
                .dashboard-grid { grid-template-columns: 1fr; }
                .widget-chart, .widget-history { grid-column: span 1; }
            }
        </style>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Centro de Mando</h2>
            <div style="display: flex; gap: 1rem;">
                <button onclick="borrarHistorial()" style="padding: 0.5rem 1rem; background: transparent; color: #e74c3c; border: 1px solid #e74c3c; border-radius: 6px; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='rgba(231, 76, 60, 0.1)'" onmouseout="this.style.background='transparent'">
                    🗑️ Borrar Historial
                </button>
                <button onclick="volverAlMenu()" style="padding: 0.5rem 1rem; background: transparent; color: #fff; border: 1px solid var(--text-muted); border-radius: 6px; cursor: pointer;">Volver al Menú</button>
            </div>
        </div>

        <div class="dashboard-grid fade-in">
            <div class="widget">
                <span class="widget-title">Nota Media</span>
                <span class="widget-value" style="color: ${colorNotaMedia}; text-shadow: 0 0 15px ${colorNotaMedia}40;">${notaMedia}</span>
            </div>
            <div class="widget">
                <span class="widget-title">Simulacros</span>
                <span class="widget-value" style="color: var(--purple-light);">${totalSimulacros}</span>
            </div>
            <div class="widget">
                <span class="widget-title">Precisión Global</span>
                <span class="widget-value" style="color: #f1c40f;">${tasaAcierto}%</span>
            </div>
            <div class="widget">
                <span class="widget-title">Volumen Realizado</span>
                <span class="widget-value" style="color: #e67e22;">${totalPreguntasRespondidas}</span>
            </div>

            <div class="widget widget-chart">
                <span class="widget-title" style="margin-bottom: 1rem;">Evolución de Rendimiento</span>
                <div style="position: relative; height: 280px; width: 100%;">
                    <canvas id="evolucionChart"></canvas>
                </div>
            </div>

            <div class="widget widget-history">
                <span class="widget-title" style="margin-bottom: 1rem;">Últimos 5 simulacros</span>
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1); color: var(--text-muted); text-transform: uppercase; font-size: 0.8rem;">
                            <th style="padding: 1rem;">Identificador</th>
                            <th style="padding: 1rem;">Fecha estelar</th>
                            <th style="padding: 1rem;">Aciertos</th>
                            <th style="padding: 1rem;">Nota Final</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filasTabla}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    setTimeout(() => {
        const ctx = document.getElementById('evolucionChart').getContext('2d');
        const etiquetas = historial.map((_, i) => `T-${i + 1}`);
        const datosNotas = historial.map(ex => ex.notaFinal);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas,
                datasets: [{
                    label: 'Nota obtenida',
                    data: datosNotas,
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#16161e',
                    pointBorderColor: '#9b59b6',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0a0b0' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0a0b0' }
                    }
                }
            }
        });
    }, 100);
}

// ==========================================
// 8. VISTA DE DETALLE DE EXAMEN
// ==========================================
function verDetalleTest(idTest) {
    const historial = JSON.parse(localStorage.getItem('historialExamenes')) || [];
    const test = historial.find(t => t.id === idTest);
    
    if (!test) return;

    const container = document.getElementById('modulo-container');
    const colorNota = test.notaFinal >= 5.0 ? '#2ecc71' : '#e74c3c';

    let htmlPreguntas = '';
    
    test.preguntasIds.forEach((idPregunta, index) => {
        const preguntaObj = AppState.baseDeDatos.find(p => p.id === idPregunta);
        if (!preguntaObj) return;

        const respuestaUsuario = test.respuestasUsuario[index];
        const esCorrecta = respuestaUsuario === preguntaObj.respuesta_correcta;
        const esBlanco = respuestaUsuario === null;
        
        let colorBorde = esCorrecta ? '#2ecc71' : (esBlanco ? '#95a5a6' : '#e74c3c');
        let textoEstado = esCorrecta ? '✅ Correcto' : (esBlanco ? '⚪ En blanco' : '❌ Incorrecto');

        const textoMiRespuesta = respuestaUsuario ? `${respuestaUsuario.toUpperCase()}) ${preguntaObj.opciones[respuestaUsuario]}` : 'Ninguna';
        const textoCorrecta = `${preguntaObj.respuesta_correcta.toUpperCase()}) ${preguntaObj.opciones[preguntaObj.respuesta_correcta]}`;

        htmlPreguntas += `
            <div class="fade-in" style="background: var(--panel-bg); border-left: 5px solid ${colorBorde}; padding: 1.5rem; margin-bottom: 1.5rem; border-radius: 8px; border-right: 1px solid rgba(255,255,255,0.05); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span style="color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase;">Pregunta ${index + 1}</span>
                    <span style="color: ${colorBorde}; font-weight: bold; font-size: 0.9rem;">${textoEstado}</span>
                </div>
                
                <h4 style="margin-bottom: 1rem; color: #fff; line-height: 1.5;">${preguntaObj.pregunta}</h4>
                
                <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.5rem; color: ${esBlanco ? '#95a5a6' : (esCorrecta ? '#2ecc71' : '#e74c3c')}">
                        <strong>Tu respuesta:</strong> ${textoMiRespuesta}
                    </p>
                    ${!esCorrecta ? `
                    <p style="color: #2ecc71;">
                        <strong>Respuesta correcta:</strong> ${textoCorrecta}
                    </p>` : ''}
                </div>
                
                <div style="background: rgba(155, 89, 182, 0.1); border: 1px solid rgba(155, 89, 182, 0.2); padding: 1rem; border-radius: 6px;">
                    <strong style="color: var(--purple-light);">Explicación:</strong> <span style="color: var(--text-main); line-height: 1.6; opacity: 0.9;">${preguntaObj.explicacion}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="fade-in" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2 style="color: #fff;">Auditoría del Simulacro</h2>
            <button onclick="renderizarEstadisticas(document.getElementById('modulo-container'))" 
                    style="padding: 0.6rem 1.2rem; background: transparent; color: var(--purple-light); border: 1px solid var(--purple-light); border-radius: 6px; cursor: pointer; font-weight: bold; transition: 0.3s;" onmouseover="this.style.background='var(--purple-light)'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='var(--purple-light)';">
                ⬅️ Volver a Estadísticas
            </button>
        </div>

        <div class="fade-in" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <div style="background: var(--panel-bg); padding: 1.5rem; border-radius: 8px; text-align: center; border-bottom: 3px solid ${colorNota}; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                <span style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Nota Final</span>
                <span style="font-size: 2.2rem; font-weight: 800; color: ${colorNota};">${test.notaFinal.toFixed(2)}</span>
            </div>
            <div style="background: var(--panel-bg); padding: 1.5rem; border-radius: 8px; text-align: center; border-bottom: 3px solid #2ecc71; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                <span style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Aciertos</span>
                <span style="font-size: 2.2rem; font-weight: 800; color: #2ecc71;">${test.aciertos}</span>
            </div>
            <div style="background: var(--panel-bg); padding: 1.5rem; border-radius: 8px; text-align: center; border-bottom: 3px solid #e74c3c; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                <span style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">Fallos</span>
                <span style="font-size: 2.2rem; font-weight: 800; color: #e74c3c;">${test.fallos}</span>
            </div>
            <div style="background: var(--panel-bg); padding: 1.5rem; border-radius: 8px; text-align: center; border-bottom: 3px solid #95a5a6; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                <span style="display: block; color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">En Blanco</span>
                <span style="font-size: 2.2rem; font-weight: 800; color: #95a5a6;">${test.blancos}</span>
            </div>
        </div>

        <div>
            ${htmlPreguntas}
        </div>
    `;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}