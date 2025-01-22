// Cargar los países al iniciar la página
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
          if (row[2]) {
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

// Mostrar las preguntas al hacer clic en el botón "Continuar"
function goToPregunta() {
  const selectedCountry = document.getElementById('pais').value;
  if (selectedCountry === "") {
    alert("Por favor, seleccione un país.");
    return;
  }

  // Ocultar la selección de país y mostrar la de clientes
  document.getElementById('paisSelection').style.display = 'none';
  document.getElementById('clienteSelection').style.display = 'block';
  loadClients();  // Cargar los clientes según el país seleccionado

  // Mostrar las preguntas
  document.getElementById('preguntas').style.display = 'block';
}

// Cargar los clientes según el país seleccionado
function loadClients() {
  const selectedCountry = document.getElementById('pais').value;
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
        const clientes = jsonData.filter(row => row[2] === selectedCountry)
                                 .map(row => row[1]); // Columna B (clientes)

        // Agregar clientes al dropdown
        const clienteDropdown = document.getElementById('clientes');
        clienteDropdown.innerHTML = '<option value="">Seleccionar...</option>'; // Limpiar opciones anteriores
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente;
          option.textContent = cliente;
          clienteDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}

// Cargar los países al cargar la página
document.addEventListener('DOMContentLoaded', loadCountries);
