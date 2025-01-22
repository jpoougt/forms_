// Variables globales
let clientesData = [];

// Función para cargar el archivo Excel y extraer datos
function loadExcelFile() {
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

        // Extraer países únicos de la columna "C"
        const countries = new Set();
        for (let i = 1; i < jsonData.length; i++) {
          const country = jsonData[i][2]; // Columna C (índice 2)
          if (country) countries.add(country.trim());
        }

        // Agregar países al dropdown
        const paisDropdown = document.getElementById('pais');
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          paisDropdown.appendChild(option);
        });

        // Guardar datos globalmente para uso en el formulario
        clientesData = jsonData;
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}

// Función para cargar clientes según el país seleccionado
function loadClientesByPais() {
  const paisDropdown = document.getElementById('pais');
  const clientesDropdown = document.getElementById('clientes');
  const selectedPais = paisDropdown.value;

  // Limpiar el dropdown de clientes
  clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';

  // Filtrar clientes por país
  const clientesFiltrados = clientesData.filter(
    row => row[2]?.trim() === selectedPais // Columna "C" contiene el país
  );

  // Agregar clientes al dropdown
  clientesFiltrados.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente[0]; // Asumimos que el cliente está en la columna "A"
    option.textContent = cliente[0];
    clientesDropdown.appendChild(option);
  });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Cargar el archivo Excel
  loadExcelFile();

  // Cambiar clientes al seleccionar país
  const paisDropdown = document.getElementById('pais');
  paisDropdown.addEventListener('change', loadClientesByPais);
});
