// Variables globales
let tareas = [];
let tareaEditando = null;

// Elementos del DOM
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const loading = document.getElementById('loading');
const messageArea = document.getElementById('messageArea');
const debugInfo = document.getElementById('debugInfo');
const filterStatus = document.getElementById('filterStatus');
const sortBy = document.getElementById('sortBy');
const refreshBtn = document.getElementById('refreshBtn');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');
const connectionStatus = document.getElementById('connectionStatus');

// Elementos de nivel
const levelSelector = document.getElementById('levelSelector');
const mainApp = document.getElementById('mainApp');
const currentLevelDiv = document.getElementById('currentLevel');
const formSection = document.getElementById('formSection');
const infoSection = document.getElementById('infoSection');
const debugDetails = document.getElementById('debugDetails');

// ========== FUNCIONES DE NIVEL ==========

// Seleccionar nivel de acceso
function selectLevel(level) {
    if (!validateConfig()) {
        mostrarMensaje('❌ Error: Variables de entorno no configuradas', 'error');
        return;
    }
    
    setUserLevel(level);
    mostrarMensaje(`✅ Nivel ${level} seleccionado`, 'success');
    
    // Ocultar selector y mostrar app
    levelSelector.style.display = 'none';
    mainApp.style.display = 'block';
    
    // Actualizar UI según nivel
    updateUIForLevel(level);
    
    // Cargar tareas
    cargarTareas();
}

// Cambiar nivel
function changeLevel() {
    if (confirm('¿Deseas cambiar tu nivel de acceso? Esto recargará la aplicación.')) {
        clearUserLevel();
        location.reload();
    }
}

// Actualizar UI según nivel
function updateUIForLevel(level) {
    // Mostrar nivel actual
    const levelEmojis = {
        guest: '👁️ Invitado',
        user: '👤 Usuario',
        admin: '👨‍💼 Administrador'
    };
    
    currentLevelDiv.innerHTML = `Nivel actual: <strong>${levelEmojis[level]}</strong>`;
    document.getElementById('levelInfo').textContent = levelEmojis[level];
    
    // Controlar visibilidad según nivel
    switch(level) {
        case 'guest':
            // Invitado: solo lectura
            formSection.style.display = 'none';
            debugDetails.style.display = 'none';
            break;
            
        case 'user':
            // Usuario: puede crear y editar, no eliminar
            formSection.style.display = 'block';
            debugDetails.style.display = 'none';
            break;
            
        case 'admin':
            // Admin: acceso total
            formSection.style.display = 'block';
            debugDetails.style.display = 'block';
            break;
    }
}

// ========== FUNCIONES DE UTILIDAD ==========

// Verificar estado de conexión
function verificarConexion() {
    if (window.ENV?.SUPABASE_URL && window.ENV?.SUPABASE_ANON_KEY) {
        connectionStatus.innerHTML = '<span style="color: #2ecc71;">✅ Conectado</span>';
        return true;
    } else {
        connectionStatus.innerHTML = '<span style="color: #e74c3c;">❌ No configurado</span>';
        return false;
    }
}

// Mostrar mensajes al usuario
function mostrarMensaje(texto, tipo = 'info') {
    const mensaje = document.createElement('div');
    mensaje.className = `message ${tipo}`;
    mensaje.textContent = texto;
    messageArea.appendChild(mensaje);
    
    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
        mensaje.remove();
    }, 3000);
}

// Actualizar el panel de debug
function actualizarDebug(operacion, datos) {
    // Solo admin puede ver debug
    if (getUserLevel() === 'admin') {
        debugInfo.textContent = JSON.stringify({
            operacion,
            timestamp: new Date().toISOString(),
            nivel: getUserLevel(),
            datos
        }, null, 2);
    }
}

// Formatear fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== FUNCIONES CRUD ==========

// 1. CREATE - Crear nueva tarea
async function crearTarea(datos) {
    if (!canPerformAction('create')) {
        mostrarMensaje('⚠️ No tienes permisos para crear tareas', 'warning');
        return;
    }
    
    try {
        mostrarMensaje('Creando tarea...', 'info');
        
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(datos)
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('✅ Tarea creada exitosamente', 'success');
            actualizarDebug('CREATE', resultado);
            taskForm.reset();
            await cargarTareas();
        } else {
            throw new Error(resultado.message || 'Error al crear la tarea');
        }
    } catch (error) {
        mostrarMensaje(`❌ Error: ${error.message}`, 'error');
        actualizarDebug('CREATE_ERROR', error);
    }
}

// 2. READ - Cargar todas las tareas
async function cargarTareas() {
    if (!verificarConexion()) {
        tasksList.innerHTML = '<p style="text-align: center; color: #e74c3c;">⚠️ Credenciales no configuradas. Ver panel de información.</p>';
        loading.style.display = 'none';
        return;
    }
    
    try {
        loading.style.display = 'block';
        tasksList.style.display = 'none';
        
        // Construir query con filtros
        let query = '';
        const params = [];
        
        // Filtro por estado
        if (filterStatus.value) {
            params.push(`status=eq.${filterStatus.value}`);
        }
        
        // Ordenamiento
        const orden = sortBy.value === 'priority' ? 'desc' : 'desc';
        params.push(`order=${sortBy.value}.${orden}`);
        
        if (params.length > 0) {
            query = '?' + params.join('&');
        }
        
        const response = await fetch(getApiUrl(query), {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (response.ok) {
            tareas = await response.json();
            actualizarDebug('READ', { total: tareas.length, filtros: params });
            mostrarTareas();
        } else {
            throw new Error('Error al cargar las tareas');
        }
    } catch (error) {
        mostrarMensaje(`❌ Error: ${error.message}`, 'error');
        actualizarDebug('READ_ERROR', error);
    } finally {
        loading.style.display = 'none';
        tasksList.style.display = 'grid';
    }
}

// 3. UPDATE - Actualizar tarea
async function actualizarTarea(id, datos) {
    if (!canPerformAction('update')) {
        mostrarMensaje('⚠️ No tienes permisos para actualizar tareas', 'warning');
        return;
    }
    
    try {
        mostrarMensaje('Actualizando tarea...', 'info');
        
        const response = await fetch(getApiUrl(`?id=eq.${id}`), {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(datos)
        });
        
        const resultado = await response.json();
        
        if (response.ok) {
            mostrarMensaje('✅ Tarea actualizada exitosamente', 'success');
            actualizarDebug('UPDATE', resultado);
            cancelarEdicion();
            await cargarTareas();
        } else {
            throw new Error(resultado.message || 'Error al actualizar la tarea');
        }
    } catch (error) {
        mostrarMensaje(`❌ Error: ${error.message}`, 'error');
        actualizarDebug('UPDATE_ERROR', error);
    }
}

// 4. DELETE - Eliminar tarea
async function eliminarTarea(id) {
    if (!canPerformAction('delete')) {
        mostrarMensaje('⚠️ No tienes permisos para eliminar tareas', 'warning');
        return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        return;
    }
    
    try {
        mostrarMensaje('Eliminando tarea...', 'info');
        
        const response = await fetch(getApiUrl(`?id=eq.${id}`), {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (response.ok) {
            mostrarMensaje('✅ Tarea eliminada exitosamente', 'success');
            actualizarDebug('DELETE', { id });
            await cargarTareas();
        } else {
            throw new Error('Error al eliminar la tarea');
        }
    } catch (error) {
        mostrarMensaje(`❌ Error: ${error.message}`, 'error');
        actualizarDebug('DELETE_ERROR', error);
    }
}

// ========== FUNCIONES DE UI ==========

// Mostrar las tareas en el DOM
function mostrarTareas() {
    if (tareas.length === 0) {
        tasksList.innerHTML = '<p style="text-align: center; color: #666;">No hay tareas para mostrar</p>';
        return;
    }
    
    const userLevel = getUserLevel();
    
    tasksList.innerHTML = tareas.map(tarea => `
        <div class="task-item">
            <div class="task-header">
                <h3 class="task-title">${tarea.title}</h3>
                <span class="task-priority priority-${tarea.priority}">Prioridad ${tarea.priority}</span>
            </div>
            
            ${tarea.description ? `<p class="task-description">${tarea.description}</p>` : ''}
            
            <div class="task-meta">
                <span class="task-status status-${tarea.status}">${tarea.status.replace('_', ' ')}</span>
                <span>Creada: ${formatearFecha(tarea.created_at)}</span>
            </div>
            
            <div class="task-actions">
                ${canPerformAction('update') ? 
                    `<button class="edit-btn" onclick="editarTarea(${tarea.id})">✏️ Editar</button>` : 
                    '<button class="edit-btn" disabled>✏️ Editar</button>'
                }
                ${canPerformAction('delete') ? 
                    `<button class="delete-btn" onclick="eliminarTarea(${tarea.id})">🗑️ Eliminar</button>` : 
                    '<button class="delete-btn" disabled>🗑️ Eliminar</button>'
                }
            </div>
        </div>
    `).join('');
}

// Preparar formulario para editar
function editarTarea(id) {
    if (!canPerformAction('update')) {
        mostrarMensaje('⚠️ No tienes permisos para editar tareas', 'warning');
        return;
    }
    
    tareaEditando = tareas.find(t => t.id === id);
    
    if (tareaEditando) {
        // Llenar el formulario con los datos de la tarea
        document.getElementById('taskId').value = tareaEditando.id;
        document.getElementById('title').value = tareaEditando.title;
        document.getElementById('description').value = tareaEditando.description || '';
        document.getElementById('status').value = tareaEditando.status;
        document.getElementById('priority').value = tareaEditando.priority;
        
        // Cambiar el texto del botón y mostrar cancelar
        submitBtn.textContent = 'Actualizar Tarea';
        cancelBtn.style.display = 'inline-block';
        
        // Scroll al formulario
        taskForm.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('title').focus();
    }
}

// Cancelar edición
function cancelarEdicion() {
    tareaEditando = null;
    taskForm.reset();
    document.getElementById('taskId').value = '';
    submitBtn.textContent = 'Crear Tarea';
    cancelBtn.style.display = 'none';
}

// ========== EVENT LISTENERS ==========

// Manejar envío del formulario
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datos = {
        title: document.getElementById('title').value.trim(),
        description: document.getElementById('description').value.trim() || null,
        status: document.getElementById('status').value,
        priority: parseInt(document.getElementById('priority').value)
    };
    
    const taskId = document.getElementById('taskId').value;
    
    if (taskId) {
        // Actualizar tarea existente
        await actualizarTarea(taskId, datos);
    } else {
        // Crear nueva tarea
        await crearTarea(datos);
    }
});

// Botón cancelar
cancelBtn.addEventListener('click', cancelarEdicion);

// Filtros y ordenamiento
filterStatus.addEventListener('change', cargarTareas);
sortBy.addEventListener('change', cargarTareas);
refreshBtn.addEventListener('click', cargarTareas);

// ========== INICIALIZACIÓN ==========

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar conexión
    verificarConexion();
    
    // Verificar si ya hay un nivel seleccionado
    const savedLevel = getUserLevel();
    if (savedLevel) {
        // Ya tiene nivel, mostrar app directamente
        levelSelector.style.display = 'none';
        mainApp.style.display = 'block';
        updateUIForLevel(savedLevel);
        
        if (verificarConexion()) {
            mostrarMensaje(`🚀 Conectando como ${savedLevel}...`, 'info');
            cargarTareas();
        }
    } else {
        // No hay nivel, mostrar selector
        levelSelector.style.display = 'block';
        mainApp.style.display = 'none';
    }
});

// Hacer funciones globales para los botones inline
window.editarTarea = editarTarea;
window.eliminarTarea = eliminarTarea;
window.selectLevel = selectLevel;
window.changeLevel = changeLevel;