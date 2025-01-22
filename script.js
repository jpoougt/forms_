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

// Llamar a la función cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();
});

function btn_siguiente() {
  const selectedPais = document.getElementById("pais").value;

  if (selectedPais) {
    // Guardar el país seleccionado en el localStorage
    localStorage.setItem("paisSeleccionado", selectedPais);

    // Redirigir a la pantalla 2
    window.location.href = "formulario.html";
  } else {
    alert("Por favor, seleccione un país antes de continuar.");
  }
}

// Función para cargar clientes según el país seleccionado
function loadClientes() {
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

        // Recuperar el país seleccionado del localStorage
        const selectedCountry = localStorage.getItem('selectedCountry');

        // Filtrar clientes por país
        const clientes = [];
        jsonData.forEach(row => {
          if (row[2] === selectedCountry && row[3]) { // Columna C es el país, columna D es el cliente
            clientes.push(row[3]); // Agregar cliente a la lista
          }
        });

        // Poblar el dropdown de clientes
        const clientesDropdown = document.getElementById('clientes');
        clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>'; // Resetear opciones
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente;
          option.textContent = cliente;
          clientesDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar los clientes:', error));
}

// Llamar a la función de carga de clientes cuando se cargue la página
document.addEventListener('DOMContentLoaded', loadClientes);

