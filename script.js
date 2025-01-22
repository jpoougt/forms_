// Cargar países desde el archivo Excel
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

        // Extraer los países (Columna C)
        const countries = new Set();
        jsonData.forEach(row => {
          if (row[2]) { // Columna C = índice 2
            countries.add(row[2].trim());
          }
        });

        // Agregar países al dropdown
        const countryDropdown = document.getElementById('pais');
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          countryDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}

// Cargar clientes según el país seleccionado
function loadClients() {
  const selectedCountry = document.getElementById('pais').value;
  if (!selectedCountry) {
    alert('Seleccione un país primero.');
    return;
  }

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

        // Filtrar clientes por país
        const clients = jsonData
          .filter(row => row[2] === selectedCountry && row[1]) // Columna B = clientes
          .map(row => row[1]);

        // Agregar clientes al dropdown
        const clientDropdown = document.getElementById('clientes');
        clientDropdown.innerHTML = '<option value="">Seleccionar...</option>';
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientDropdown.appendChild(option);
        });

        // Mostrar el selector de clientes
        document.getElementById('clienteSelection').style.display = 'block';
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}
//funcion para ir a la selección de cliente
function goToCliente() {
  const paisSelection = document.getElementById('paisSelection');
  const clienteSelection = document.getElementById('clienteSelection');

  paisSelection.style.transform = 'translateX(-100%)'; // Desplazar hacia la izquierda
  clienteSelection.style.display = 'block'; // Hacer visible la selección de cliente
  setTimeout(() => {
    clienteSelection.style.transform = 'translateX(0)'; // Volver a su lugar
  }, 200);
}

// Función para volver a la selección de país
function goBackToPaisSelection() {
  const paisSelection = document.getElementById('paisSelection');
  const clienteSelection = document.getElementById('clienteSelection');
  const preguntas = document.getElementById('preguntas');

  // Mostrar la selección de país y ocultar las otras secciones
  paisSelection.style.display = 'block';
  clienteSelection.style.display = 'none';
  preguntas.style.display = 'none';

  // Limpiar selecciones anteriores
  document.getElementById('pais').value = '';
  document.getElementById('clientes').value = '';

  // Resetear transformaciones (reestablecer la posición)
  clienteSelection.style.transform = 'translateX(100%)';
}



// Función para mostrar la siguiente sección con transición
function goToClienteSelection() {
  const paisSelection = document.getElementById('paisSelection');
  const clienteSelection = document.getElementById('clienteSelection');
  const preguntas = document.getElementById('preguntas');

  // Ocultar la selección de país y mostrar la selección de clientes
  paisSelection.style.display = 'none';
  clienteSelection.style.display = 'block';

  // Activar la transición para el movimiento hacia la sección de clientes
  clienteSelection.style.transform = 'translateX(0)'; // Animación de entrada
  preguntas.style.display = 'none'; // Las preguntas se ocultan inicialmente

  // Limpiar la selección de cliente anterior (en caso de que lo haya)
  document.getElementById('clientes').value = '';
}


// Función para mostrar las preguntas
function showQuestions() {
  const preguntas = document.getElementById('preguntas');
  preguntas.style.display = 'block';
}


// Llamar a la función cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();

  // Agregar evento al botón de continuar
  document.getElementById('continueBtn').addEventListener('click', () => {
    loadClients();
  });

  // Agregar evento al cambio del cliente
  document.getElementById('clientes').addEventListener('change', () => {
    showQuestions();
  });
});
