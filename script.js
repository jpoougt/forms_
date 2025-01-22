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

        // Extraer los países (Columna C = índice 2)
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

// Guardar el país seleccionado y redirigir
function goToFormulario() {
  const selectedCountry = document.getElementById('pais').value;
  if (!selectedCountry) {
    alert('Seleccione un país antes de continuar.');
    return;
  }
  localStorage.setItem('selectedCountry', selectedCountry);
  window.location.href = '#'; // Aquí puedes definir a dónde redirigir (actualmente se queda en la misma página)
}

// Cargar clientes según el país seleccionado
function loadClients() {
  const selectedCountry = localStorage.getItem('selectedCountry');
  if (!selectedCountry) {
    alert('No se ha seleccionado un país. Redirigiendo a la pantalla principal.');
    window.location.href = '#'; // Aquí rediriges según lo necesites
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

        // Filtrar clientes por país (Columna C = índice 2, Columna B = índice 1)
        const clients = jsonData
          .filter(row => row[2] && row[2].trim() === selectedCountry) // Filtramos por el país
          .map(row => row[1]); // Leemos la columna B para los clientes (índice 1)

        // Agregar clientes al dropdown
        const clientsDropdown = document.getElementById('clientes');
        clientsDropdown.innerHTML = ''; // Limpiar dropdown antes de agregar nuevos clientes
        clients.forEach(client => {
          const option = document.createElement('option');
          option.value = client;
          option.textContent = client;
          clientsDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}
