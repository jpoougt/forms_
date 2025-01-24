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
    fromSection.style.display = 'none';
    toSection.style.display = 'block';

    // Mostrar u ocultar el botón "Volver" solo en la selección de clientes
    backButton.style.display = to === 'seccionCliente' ? 'flex' : 'none';

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

  switchSection('seccionPais', 'seccionCliente', 'left');
});

// Botón "Volver" - Regresa a la selección de país y resetea todo
document.getElementById('backBtn').addEventListener('click', () => {
  // Ocultar todas las preguntas y reiniciar respuestas
  document.getElementById('preguntas').style.display = 'none';
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.checked = false; // Desmarcar todas las respuestas
  });

  // Ocultar preguntas dependientes
  document.querySelectorAll('.dependiente').forEach(pregunta => {
    pregunta.style.display = 'none';
  });

  // Reiniciar selección de cliente
  document.getElementById('clientes').value = "";

  switchSection('seccionCliente', 'seccionPais', 'right');
});

//  **Mostrar preguntas solo si se selecciona un cliente**
document.getElementById('clientes').addEventListener('change', () => {
  const clienteSeleccionado = document.getElementById('clientes').value;
  const preguntasDiv = document.getElementById('preguntas');

  if (clienteSeleccionado) {
    preguntasDiv.style.display = 'block';
  } else {
    preguntasDiv.style.display = 'none';
  }
});

//  **Mostrar preguntas dependientes basadas en respuestas**
function setupDependentQuestions(parentName, dependentId) {
  document.querySelectorAll(`input[name="${parentName}"]`).forEach(radio => {
    radio.addEventListener('change', function () {
      const preguntaDependiente = document.getElementById(dependentId);
      if (this.value === 'si') {
        preguntaDependiente.style.display = 'block';
      } else {
        preguntaDependiente.style.display = 'none';
        // Resetear valores si se oculta
        preguntaDependiente.querySelectorAll('input').forEach(input => input.checked = false);
      }
    });
  });
}

// Configurar dependencias de preguntas
setupDependentQuestions('pregunta2', 'pregunta2_1');
setupDependentQuestions('pregunta3', 'pregunta3_1');
setupDependentQuestions('pregunta3', 'pregunta3_2');
setupDependentQuestions('pregunta4', 'pregunta4_1');
setupDependentQuestions('pregunta4', 'pregunta4_2');

// Inicializar
loadCountries();
