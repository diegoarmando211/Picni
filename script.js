// Efecto de scroll en el header
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll para los enlaces de navegación
document.querySelectorAll('.nav-menu a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Modal de Reserva
const modal = document.getElementById('modalReserva');
const btnsReserva = document.querySelectorAll('.btn-reserva');
const spanCerrar = document.querySelector('.modal-cerrar');

// Abrir modal
btnsReserva.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// Cerrar modal
spanCerrar.addEventListener('click', function() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Cerrar modal al hacer click fuera
window.addEventListener('click', function(e) {
    if (e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Calcular precio en tiempo real
const servicioSelect = document.getElementById('servicioSelect');
const checkboxes = document.querySelectorAll('input[name="extras"]');
const personasInput = document.getElementById('personasInput');

// Validar cantidad de personas según el servicio
servicioSelect.addEventListener('change', function() {
    const servicioValue = this.value;
    
    if (servicioValue) {
        personasInput.disabled = false;
        
        // Configurar límites según el servicio
        if (servicioValue === 'basico') {
            personasInput.min = 1;
            personasInput.max = 3;
            personasInput.placeholder = 'Cantidad de personas (1-3) *';
            personasInput.title = 'Servicio Básico: mínimo 1, máximo 3 personas';
        } else if (servicioValue === 'estandar') {
            personasInput.min = 1;
            personasInput.max = 6;
            personasInput.placeholder = 'Cantidad de personas (1-6) *';
            personasInput.title = 'Servicio Estándar: mínimo 1, máximo 6 personas';
        } else if (servicioValue === 'premium') {
            personasInput.min = 1;
            personasInput.max = 10;
            personasInput.placeholder = 'Cantidad de personas (1-10) *';
            personasInput.title = 'Servicio Premium: mínimo 1, máximo 10 personas';
        }
        
        // Resetear valor si está fuera del rango
        const valorActual = parseInt(personasInput.value);
        if (valorActual && (valorActual < personasInput.min || valorActual > personasInput.max)) {
            personasInput.value = '';
        }
    } else {
        personasInput.disabled = true;
        personasInput.value = '';
    }
    
    calcularPrecio();
});

// Validar personas al cambiar el valor
personasInput.addEventListener('change', function() {
    const min = parseInt(this.min);
    const max = parseInt(this.max);
    const valor = parseInt(this.value);
    
    if (valor < min || valor > max) {
        alert(`Para este servicio, la cantidad de personas debe ser entre ${min} y ${max}`);
        this.value = '';
    }
});

function calcularPrecio() {
    let subtotal = 0;
    
    // Precio del servicio base
    const servicioSeleccionado = servicioSelect.selectedOptions[0];
    if (servicioSeleccionado && servicioSeleccionado.dataset.precio) {
        subtotal += parseFloat(servicioSeleccionado.dataset.precio);
    }
    
    // Sumar extras
    checkboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.dataset.precio) {
            subtotal += parseFloat(checkbox.dataset.precio);
        }
    });
    
    // Calcular IGV
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    
    // Actualizar la UI
    document.getElementById('subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('igv').textContent = `S/ ${igv.toFixed(2)}`;
    document.getElementById('total').textContent = `S/ ${total.toFixed(2)}`;
}

checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', calcularPrecio);
});

// Validación de fecha (no puede ser anterior a hoy)
const fechaInput = document.getElementById('fechaReserva');
const horaInput = document.getElementById('horaReserva');

// Establecer fecha mínima (hoy)
const hoy = new Date();
const fechaMinima = hoy.toISOString().split('T')[0];
fechaInput.setAttribute('min', fechaMinima);

// Validar hora (7am - 6pm)
horaInput.addEventListener('change', function() {
    const hora = parseInt(this.value.split(':')[0]);
    if (hora < 7 || hora > 18) {
        alert('El horario de atención es de 7:00 AM a 6:00 PM');
        this.value = '';
    }
});

// Enviar formulario
document.getElementById('formReserva').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar fecha
    const fechaSeleccionada = new Date(fechaInput.value);
    const hoyDate = new Date();
    hoyDate.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoyDate) {
        alert('No puedes hacer una reserva para una fecha pasada');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = new FormData(this);
    
    // Crear mensaje sin emojis problemáticos para WhatsApp
    let mensaje = '*NUEVA RESERVA DE PICNIC*\n';
    mensaje += '========================\n\n';
    
    mensaje += '*DATOS PERSONALES*\n';
    mensaje += `Nombre: ${formData.get('nombre')}\n`;
    mensaje += `Telefono: ${formData.get('telefono')}\n`;
    mensaje += `Email: ${formData.get('email')}\n\n`;
    
    mensaje += '*DETALLES DE LA RESERVA*\n';
    mensaje += `Fecha: ${formData.get('fecha')}\n`;
    mensaje += `Hora: ${formData.get('hora')}\n`;
    mensaje += `Duracion: ${formData.get('duracion')} horas\n`;
    mensaje += `Personas: ${formData.get('personas')}\n`;
    mensaje += `Motivo: ${formData.get('motivo')}\n\n`;
    
    mensaje += '*SERVICIO SELECCIONADO*\n';
    const servicio = servicioSelect.selectedOptions[0].text;
    mensaje += `Tipo: ${servicio}\n`;
    if (formData.get('estilo')) mensaje += `Estilo: ${formData.get('estilo')}\n`;
    if (formData.get('colores')) mensaje += `Colores: ${formData.get('colores')}\n\n`;
    
    // Extras
    const extrasSeleccionados = [];
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const texto = cb.parentElement.textContent.trim();
            extrasSeleccionados.push(texto);
        }
    });
    if (extrasSeleccionados.length > 0) {
        mensaje += '*SERVICIOS ADICIONALES*\n';
        extrasSeleccionados.forEach(extra => {
            mensaje += `- ${extra}\n`;
        });
        mensaje += '\n';
    }
    
    mensaje += '*UBICACION*\n';
    mensaje += `Direccion: ${formData.get('direccion')}\n`;
    if (formData.get('referencia')) mensaje += `Referencia: ${formData.get('referencia')}\n`;
    if (formData.get('tipo_lugar')) mensaje += `Tipo de lugar: ${formData.get('tipo_lugar')}\n`;
    mensaje += `Presente en montaje: ${formData.get('presente') ? 'Si' : 'No'}\n\n`;
    
    if (formData.get('restricciones')) {
        mensaje += '*RESTRICCIONES ALIMENTARIAS*\n';
        mensaje += `${formData.get('restricciones')}\n\n`;
    }
    
    if (formData.get('notas')) {
        mensaje += '*NOTAS ADICIONALES*\n';
        mensaje += `${formData.get('notas')}\n\n`;
    }
    
    mensaje += '*METODO DE PAGO*\n';
    mensaje += `${formData.get('metodo_pago').toUpperCase()}\n\n`;
    
    mensaje += '========================\n';
    mensaje += `*TOTAL A PAGAR: ${document.getElementById('total').textContent}*\n`;
    mensaje += '(Incluye IGV)\n';
    mensaje += '========================';
    
    // Enviar por WhatsApp
    const numeroWhatsApp = '51971047099';
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    // Cerrar modal y resetear formulario
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.reset();
        calcularPrecio();
        alert('¡Gracias! Tu reserva ha sido enviada. Te contactaremos pronto.');
    }, 1000);
});
