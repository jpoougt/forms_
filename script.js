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

// Función para mostrar las preguntas
function showQuestions() {
  const selectedClient = document.getElementById('clientes').value;
  if (!selectedClient) {
    alert('Seleccione un cliente primero.');
    return;
  }

  // Mostrar las preguntas
  document.getElementById('preguntas').style.display = 'block';
  window.scrollTo(0, document.body.scrollHeight); // Desplazarse hacia las preguntas
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
