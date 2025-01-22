// Función para cargar los países desde el archivo Excel
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
        const countries = new Set(); // Usamos un Set para evitar duplicados
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

// Función para cargar los clientes según el país seleccionado
function loadClients() {
  const selectedCountry = document.getElementById('pais').value;
  if (!selectedCountry) {
    alert('Por favor, selecciona un país.');
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

        // Filtrar clientes por país (Columna C = índice 2, Columna B = índice 1 para clientes)
        const clients = jsonData
          .filter(row => row[2] && row[2].trim() === selectedCountry)  // Filtramos por país
          .map(row => row[1]);  // Obtenemos los clientes (Columna B = índice 1)

        // Limpiar el dropdown de clientes antes de agregar nuevas opciones
        const clientDropdown = document.getElementById('clientes');
        clientDropdown.innerHTML = '<option value="">Seleccionar...</option>';  // Reseteamos

        // Agregar clientes al dropdown
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientDropdown.appendChild(option);
        });

        // Mostrar la sección de clientes
        const clienteSection = document.getElementById('clienteSelection');
        clienteSection.classList.remove('hidden');
        clienteSection.classList.add('visible');
        
        // Desplegar preguntas solo cuando se seleccione un cliente
        const continueButton = document.getElementById('continueBtn');
        continueButton.disabled = false;  // Habilitamos el botón
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar los clientes:', error));
}

// Función para manejar la transición a las preguntas
function goToQuestions() {
  const selectedClient = document.getElementById('clientes').value;
  if (!selectedClient) {
    alert('Por favor, selecciona un cliente antes de continuar.');
    return;
  }

  // Mostrar la sección de preguntas con la animación
  const preguntasSection = document.getElementById('preguntas');
  preguntasSection.classList.remove('hidden');
  preguntasSection.classList.add('visible');

  // Deshabilitar la selección del país y cliente
  document.getElementById('paisSelection').classList.add('hidden');
  document.getElementById('clienteSelection').classList.add('hidden');
}

// Llamar a la función para cargar los países cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
  loadCountries();
  // Agregar un manejador para el botón de "Continuar" (para cargar clientes)
  document.getElementById('continueBtn').addEventListener('click', function() {
    loadClients();
  });
  // Agregar un manejador para el botón de "Continuar" (para pasar a las preguntas)
  document.getElementById('continueBtnQuestions').addEventListener('click', function() {
    goToQuestions();
  });
});
