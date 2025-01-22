// Función para cargar el archivo Excel y extraer los países
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

        // Extraer la columna "País" (Columna C)
        const countries = new Set(); // Usamos un Set para evitar duplicados
        jsonData.forEach(row => {
          if (row[2]) { // Columna C es índice 2 (0-A, 1-B, 2-C)
            countries.add(row[2].trim());
          }
        });

        // Agregar países al dropdown
        const dropdown = document.getElementById('pais');
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          dropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}

// Función para cargar los clientes del país seleccionado
function loadClientsByCountry(selectedCountry) {
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

        // Filtrar clientes por país (Columna C - País y Columna A - Cliente)
        const clients = jsonData
          .filter(row => row[2]?.trim() === selectedCountry) // Filtrar por país
          .map(row => row[0]?.trim()) // Columna A es índice 0 (Clientes)
          .filter(Boolean); // Eliminar valores nulos o undefined

        // Agregar clientes al dropdown
        const dropdown = document.getElementById('clientes');
        dropdown.innerHTML = ''; // Limpiar las opciones anteriores
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          dropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar clientes:', error));
}

// Navegar a la pantalla del formulario
function btn_siguiente() {
  const selectedCountry = document.getElementById('pais').value;
  if (selectedCountry) {
    localStorage.setItem('selectedCountry', selectedCountry); // Guardar país seleccionado
    window.location.href = 'formulario.html'; // Redirigir a formulario.html
  } else {
    alert('Por favor, seleccione un país.');
  }
}

// Cargar clientes en formulario.html
function populateClientsDropdown() {
  const selectedCountry = localStorage.getItem('selectedCountry'); // Obtener país guardado
  if (selectedCountry) {
    loadClientsByCountry(selectedCountry); // Cargar clientes del país seleccionado
  } else {
    console.error('No se encontró un país seleccionado en el localStorage.');
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Detectar en qué pantalla estamos
  const path = window.location.pathname;
  if (path.includes('index.html')) {
    loadCountries(); // Cargar países en index.html
    document.getElementById('btnContinuar').addEventListener('click', btn_siguiente);
  } else if (path.includes('formulario.html')) {
    populateClientsDropdown(); // Cargar clientes en formulario.html
  }
});
