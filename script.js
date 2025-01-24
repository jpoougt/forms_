// Variables globales
let clientesPorPais = {};

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
          const country = row[2]; 
          const client = row[1]; 
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
function switchSection(from, to) {
  const fromSection = document.getElementById(from);
  const toSection = document.getElementById(to);
  const backButton = document.getElementById('backBtn'); 

  fromSection.classList.remove('active');
  setTimeout(() => {
    fromSection.style.display = 'none';
    toSection.style.display = 'block';

    backButton.style.display = to === 'seccionCliente' ? 'flex' : 'none';

    setTimeout(() => toSection.classList.add('active'), 50);
  }, 500);
}

// Botón "Siguiente"
document.getElementById('nextBtn').addEventListener('click', () => {
  const paisSeleccionado = document.getElementById('pais').value;
  if (!paisSeleccionado) {
    alert('Por favor, seleccione un país.');
    return;
  }

  const clientesOrdenados = (clientesPorPais[paisSeleccionado] || []).sort();

  const clientesDropdown = document.getElementById('clientes');
  clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
  clientesOrdenados.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente;
    option.textContent = cliente;
    clientesDropdown.appendChild(option);
  });

  // Ocultar preguntas y resetear respuestas al cambiar de país
  document.getElementById('preguntas').style.display = 'none';
  resetForm();

  switchSection('seccionPais', 'seccionCliente');
});

// Botón "Volver"
document.getElementById('backBtn').addEventListener('click', () => {
  document.getElementById('preguntas').style.display = 'none';
  document.getElementById('clientes').value = "";

  resetForm(); // Resetear todas las respuestas

  switchSection('seccionCliente', 'seccionPais');
});

// Función para resetear todas las respuestas
function resetForm() {
  document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
    input.checked = false;
  });

  // Ocultar preguntas dependientes al resetear
  document.querySelectorAll('.dependiente').forEach(pregunta => {
    pregunta.style.display = 'none';
  });
}

// Mostrar preguntas solo si se selecciona un cliente
document.getElementById('clientes').addEventListener('change', () => {
  const clienteSeleccionado = document.getElementById('clientes').value;
  document.getElementById('preguntas').style.display = clienteSeleccionado ? 'block' : 'none';
});

// Mostrar preguntas dependientes según respuestas
function setupDependentQuestions(parentName, dependentId) {
  document.querySelectorAll(`input[name="${parentName}"]`).forEach(radio => {
    radio.addEventListener('change', function () {
      const preguntaDependiente = document.getElementById(dependentId);
      if (this.value === 'si') {
        preguntaDependiente.style.display = 'block';
      } else {
        preguntaDependiente.style.display = 'none';
        resetSubInputs(preguntaDependiente);
      }
    });
  });
}

// Función para resetear los inputs dentro de una pregunta dependiente
function resetSubInputs(container) {
  container.querySelectorAll('input').forEach(input => input.checked = false);
}

// Configurar dependencias de preguntas
setupDependentQuestions('pregunta2', 'pregunta2_1');
setupDependentQuestions('pregunta3', 'pregunta3_1');
setupDependentQuestions('pregunta3', 'pregunta3_2');
setupDependentQuestions('pregunta4', 'pregunta4_1');
setupDependentQuestions('pregunta4', 'pregunta4_2');

// Inicializar
loadCountries();
