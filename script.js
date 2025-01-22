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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Procesar los datos del Excel
        clientesData = jsonData;

        // Extraer y mostrar países únicos
        const uniquePaises = [...new Set(jsonData.map(item => item.País))].sort();
        populatePaisesDropdown(uniquePaises);
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => console.error('Error al cargar el archivo Excel:', error));
}

// Función para llenar el dropdown de países
function populatePaisesDropdown(paises) {
  const paisesDropdown = document.getElementById("paises");
  paises.forEach(pais => {
    const option = document.createElement("option");
    option.value = pais;
    option.textContent = pais;
    paisesDropdown.appendChild(option);
  });
}

// Función para manejar la selección del país y filtrar clientes
function handlePaisChange() {
  const paisSeleccionado = document.getElementById("paises").value;
  const clientesFiltrados = clientesData.filter(cliente => cliente.País === paisSeleccionado);

  // Guardar los clientes filtrados en localStorage
  localStorage.setItem("clientesFiltrados", JSON.stringify(clientesFiltrados));
}

// Evento para redirigir a la pantalla de formulario
function goToFormulario() {
  const paisSeleccionado = document.getElementById("paises").value;
  if (paisSeleccionado) {
    window.location.href = "formulario.html";
  } else {
    alert("Por favor, selecciona un país.");
  }
}

// Cargar el archivo Excel al iniciar
document.addEventListener("DOMContentLoaded", () => {
  loadExcelFile();

  // Agregar evento para manejar el cambio de país
  const paisesDropdown = document.getElementById("paises");
  paisesDropdown.addEventListener("change", handlePaisChange);

  // Agregar evento al botón de continuar
  const continuarBtn = document.getElementById("continuarBtn");
  continuarBtn.addEventListener("click", goToFormulario);
});
