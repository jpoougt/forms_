// Variables globales
let clientesPorPais = {}; // Objeto para almacenar los clientes por país

// Cargar países desde el archivo Excel y ordenarlos alfabéticamente
function loadCountries() {
  fetch('SondeoClientes.xlsx')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Obtener países y clientes
        const countries = new Set();
        jsonData.slice(1).forEach(row => {
          const country = row[2]; // Columna C: País
          const client = row[1]; // Columna B: Cliente
          if (country && client) {
            countries.add(country);
            if (!clientesPorPais[country]) {
              clientesPorPais[country] = [];
            }
            clientesPorPais[country].push(client);
          }
        });

        // Convertir a array y ordenar alfabéticamente
        const sortedCountries = [...countries].sort();

        // Llenar el dropdown de países ordenado
        const paisDropdown = document.getElementById('pais');
        sortedCountries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          paisDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error cargando el archivo:', error));
}

// Función para cambiar de sección con efecto de barrido
function switchSection(from, to, direction = 'left') {
  const fromSection = document.getElementById(from);
  const toSection = document.getElementById(to);
  const backButton = document.getElementById('backBtn'); // Botón volver

  // Ocultar la sección actual con animación
  fromSection.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
  fromSection.style.opacity = '0';

  setTimeout(() => {
    fromSection.style.display = 'none'; // Ocultar completamente
    toSection.style.display = 'block';

    // Mostrar u ocultar el botón "Volver" según la sección
    if (to === 'seccionCliente') {
      backButton.style.display = 'flex'; // Mostrar el botón cuando se pasa a clientes
    } else {
      backButton.style.display = 'none'; // Ocultar el botón en la selección de país
    }

    setTimeout(() => {
      toSection.style.opacity = '1';
      toSection.style.transform = 'translateX(0)';
    }, 50);
  }, 500);
}

// Botón "Siguiente" - Muestra los clientes del país seleccionado y avanza de sección
document.getElementById('nextBtn').addEventListener('click', () => {
  const paisSeleccionado = document.getElementById('pais').value;
  if (!paisSeleccionado) {
    alert('Por favor, seleccione un país.');
    return;
  }

  // Obtener la lista de clientes y ordenarlos alfabéticamente
  const clientesOrdenados = (clientesPorPais[paisSeleccionado] || []).sort();

  // Llenar el dropdown de clientes ordenados
  const clientesDropdown = document.getElementById('clientes');
  clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
  clientesOrdenados.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente;
    option.textContent = cliente;
    clientesDropdown.appendChild(option);
  });

  // Ocultar preguntas al cambiar de país
  document.getElementById('preguntas').style.display = 'none';

  switchSection('seccionPais', 'seccionCliente', 'left');
});

// Botón "Volver" - Regresa a la selección de país
document.getElementById('backBtn').addEventListener('click', () => {
  // Ocultar las preguntas y limpiar la selección de cliente
  document.getElementById('preguntas').style.display = 'none';
  document.getElementById('clientes').value = "";

  // Resetear las respuestas seleccionadas
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });

  switchSection('seccionCliente', 'seccionPais', 'right');
});

// Manejo de la selección de cliente para mostrar preguntas
document.getElementById('clientes').addEventListener('change', () => {
  const clienteSeleccionado = document.getElementById('clientes').value;
  const preguntasDiv = document.getElementById('preguntas');

  if (clienteSeleccionado) {
    preguntasDiv.style.display = 'block'; // Mostrar solo si hay cliente seleccionado
  } else {
    preguntasDiv.style.display = 'none'; // Ocultar si no hay cliente
  }
});

// Manejo de preguntas dependientes
document.querySelectorAll('input[name="pregunta2"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const subPregunta = document.getElementById('pregunta2_1');
    subPregunta.style.display = this.value === 'si' ? 'block' : 'none';
  });
});

document.querySelectorAll('input[name="pregunta3"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const subPreguntas = document.querySelectorAll('.pregunta3_dependientes');
    subPreguntas.forEach(pregunta => {
      pregunta.style.display = this.value === 'si' ? 'block' : 'none';
    });
  });
});

document.querySelectorAll('input[name="pregunta4"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const subPreguntas = document.querySelectorAll('.pregunta4_dependientes');
    subPreguntas.forEach(pregunta => {
      pregunta.style.display = this.value === 'si' ? 'block' : 'none';
    });
  });
});

// Inicializar
loadCountries();
