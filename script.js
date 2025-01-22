// Cargar los países desde el archivo Excel
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

        const countries = new Set();
        jsonData.forEach(row => {
          if (row[1]) {  // Asegurarse de que se lee la columna correcta (Columna B)
            countries.add(row[1].trim());  // Columna B es el país
          }
        });

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

// Cargar los clientes según el país seleccionado
function loadClients() {
  const selectedCountry = document.getElementById('pais').value;
  if (!selectedCountry) {
    alert('Por favor, seleccione un país.');
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

        const clients = jsonData
          .filter(row => row[1] === selectedCountry)  // Filtra por país
          .map(row => row[0]);  // Extrae el cliente (Columna A)

        const clientDropdown = document.getElementById('clientes');
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar los clientes:', error));
}

// Función para mostrar las preguntas
function goToPregunta() {
  const paisSelection = document.getElementById('paisSelection');
  const clienteSelection = document.getElementById('clienteSelection');
  const preguntas = document.getElementById('preguntas');
  
  paisSelection.style.display = 'none';  // Ocultar la selección de país
  clienteSelection.style.display = 'block';  // Mostrar la selección de cliente
  preguntas.style.display = 'block';  // Mostrar las preguntas
}
