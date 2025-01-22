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

        // Extraer los países (Columna C = índice 2)
        const countries = new Set();
        jsonData.forEach(row => {
          if (row[2]) { // Verificar si hay valor en la columna C
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

// Función para redirigir a la segunda parte del formulario (aunque no necesitamos otra página)
function goToFormulario() {
  const selectedCountry = document.getElementById('pais').value;
  if (!selectedCountry) {
    alert('Seleccione un país antes de continuar.');
    return;
  }
  localStorage.setItem('selectedCountry', selectedCountry);
  // Ya no hacemos redirección ya que todo está en una sola página, eliminamos window.location.href
  loadClients();
}

// Cargar clientes basados en el país seleccionado
function loadClients() {
  const selectedCountry = localStorage.getItem('selectedCountry');
  if (!selectedCountry) {
    alert('No se ha seleccionado un país. Redirigiendo...');
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

        // Filtrar clientes según el país seleccionado (Columna C = índice 2 y Columna B = índice 1 para clientes)
        const clients = jsonData
          .filter(row => row[2] && row[2].trim() === selectedCountry)
          .map(row => row[1]); // Columna B = índice 1

        // Llenar el dropdown de clientes con las opciones correspondientes
        const clientsDropdown = document.getElementById('clientes');
        clientsDropdown.innerHTML = ''; // Limpiar el dropdown actual
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientsDropdown.appendChild(option);
        });

        // Habilitar el dropdown de clientes ahora que hay opciones
        clientsDropdown.disabled = clients.length === 0;
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel para los clientes:', error));
}

// Llamar a loadCountries cuando el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();
});
