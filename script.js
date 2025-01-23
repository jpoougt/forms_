// Variables globales
let data = []; // Para almacenar los datos del archivo Excel

// Cargar el archivo Excel y poblar el dropdown de países
function loadCountries() {
  fetch('SondeoClientes.xlsx')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const excelData = new Uint8Array(e.target.result);
        const workbook = XLSX.read(excelData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Guardar datos globalmente y poblar el dropdown de países
        data = jsonData.slice(1); // Ignorar encabezados
        const countries = [...new Set(data.map(row => row[1]))]; // Columna B (País)

        const paisDropdown = document.getElementById('pais');
        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country;
          option.textContent = country;
          paisDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error cargando el archivo Excel:', error));
}

// Filtrar clientes por país seleccionado
function loadClients() {
  const selectedCountry = document.getElementById('pais').value;
  const clientsDropdown = document.getElementById('cliente');

  // Limpiar dropdown previo
  clientsDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';

  // Filtrar clientes del país seleccionado
  const filteredClients = data.filter(row => row[1] === selectedCountry).map(row => row[0]); // Columna A (Cliente)
  filteredClients.forEach(client => {
    const option = document.createElement('option');
    option.value = client;
    option.textContent = client;
    clientsDropdown.appendChild(option);
  });

  // Mostrar el dropdown de clientes y la sección de preguntas
  document.getElementById('clienteSection').classList.remove('hidden');
  document.getElementById('preguntas').classList.add('hidden');
}

// Mostrar preguntas al seleccionar un cliente
function showQuestions() {
  const selectedClient = document.getElementById('cliente').value;
  if (selectedClient) {
    document.getElementById('preguntas').classList.remove('hidden');
  }
}

// Agregar el efecto de transición entre secciones
function goToNextSection() {
  const firstSection = document.getElementById('paisSelection');
  const secondSection = document.getElementById('clienteSection');

  firstSection.classList.add('slide-left');
  secondSection.classList.remove('hidden');
  secondSection.classList.add('slide-in');
}

// Evento inicial cuando el DOM se carga
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();

  document.getElementById('pais').addEventListener('change', loadClients);
  document.getElementById('cliente').addEventListener('change', showQuestions);
  document.getElementById('btnSiguiente').addEventListener('click', goToNextSection);
});
