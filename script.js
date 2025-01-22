document.addEventListener('DOMContentLoaded', function() {
  // Llamar a la función para cargar los países cuando se cargue el documento
  loadCountries();
});

// Cargar países desde el archivo Excel en index.html
// Cargar países desde el archivo Excel en index.html
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

        // Eliminar la primera fila si es un encabezado
        jsonData.shift(); // Eliminamos la primera fila que es el encabezado

        // Filtrar las filas vacías o que no contienen datos válidos
        const countries = new Set(); // Usamos un Set para evitar duplicados
        jsonData.forEach(row => {
          if (row[2] && row[2].trim() && row[2] !== 'País') { // Aseguramos que no sea la palabra "País" ni vacía
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



// Cargar los clientes basados en el país seleccionado
document.getElementById('pais').addEventListener('change', function() {
  const selectedCountry = this.value;

  if (!selectedCountry) {
    return;
  }

  // Mostrar el dropdown de clientes
  document.getElementById('clienteSelection').style.display = 'block';

  // Filtrar los clientes por país
  loadClients(selectedCountry);
});

// Función para cargar los clientes según el país
function loadClients(country) {
  fetch('SondeoClientes.xlsx')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const clients = [];
        jsonData.forEach(row => {
          if (row[2] === country && row[1]) { // Filtrar por país (columna C - índice 2) y obtener cliente de la columna B (índice 1)
            clients.push(row[1]);
          }
        });

        // Mostrar los clientes en el dropdown
        const clientDropdown = document.getElementById('clientes');
        clientDropdown.innerHTML = '<option value="">Seleccionar...</option>'; // Limpiar el dropdown

        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientDropdown.appendChild(option);
        });

        // Mostrar las preguntas
        document.getElementById('preguntas').style.display = 'block';
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}
