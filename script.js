// Variables globales
let clientesData = [];

// Función para leer el archivo Excel y cargar los países en la pantalla 1
document.addEventListener("DOMContentLoaded", () => {
  const paisesDropdown = document.getElementById("paises");
  
  // Leer el archivo Excel al cargar la página
  fetch('SondeoClientes.xlsx')
    .then(response => response.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Guardar datos globalmente
        clientesData = jsonData;

        // Extraer lista única de países
        const paises = [...new Set(jsonData.map(row => row.País))].sort();

        // Poblar dropdown de países
        paises.forEach(pais => {
          const option = document.createElement("option");
          option.value = pais;
          option.textContent = pais;
          paisesDropdown.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(error => {
      console.error("Error al leer el archivo Excel:", error);
    });
});

// Función para manejar el evento de continuar desde la pantalla 1
function irAPantalla2() {
  const paisSeleccionado = document.getElementById("paises").value;

  if (!paisSeleccionado) {
    alert("Por favor selecciona un país.");
    return;
  }

  // Filtrar los clientes del país seleccionado
  const clientesFiltrados = clientesData.filter(row => row.País === paisSeleccionado);

  // Guardar los clientes filtrados en localStorage para usarlos en la pantalla 2
  localStorage.setItem("clientesFiltrados", JSON.stringify(clientesFiltrados));

  // Navegar a la pantalla 2
  window.location.href = "formulario.html";
}

// Función para cargar clientes en la pantalla 2
document.addEventListener("DOMContentLoaded", () => {
  const clientesDropdown = document.getElementById("clientes");
  const clientesFiltrados = JSON.parse(localStorage.getItem("clientesFiltrados")) || [];

  // Poblar dropdown de clientes
  if (clientesFiltrados.length > 0) {
    clientesFiltrados.sort((a, b) => a.Cliente.localeCompare(b.Cliente));
    clientesFiltrados.forEach(cliente => {
      const option = document.createElement("option");
      option.value = cliente.Cliente;
      option.textContent = cliente.Cliente;
      clientesDropdown.appendChild(option);
    });
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay clientes disponibles";
    clientesDropdown.appendChild(option);
  }
});

// Función para enviar los datos del formulario a Google Sheets
function sendDataToGoogleSheet() {
  const clienteSeleccionado = document.getElementById("clientes").value;
  const moduloCampos = document.querySelector('input[name="moduloCampos"]:checked')?.value;
  const moduloEquipo = document.querySelector('input[name="moduloEquipo"]:checked')?.value;
  const registrosEquipo = document.querySelector('input[name="registrosEquipo"]:checked')?.value;
  const moduloInsumos = document.querySelector('input[name="moduloInsumos"]:checked')?.value;
  const tiposProductos = Array.from(document.querySelectorAll('input[name="tiposProductos"]:checked')).map(input => input.value);
  const manejoInventarios = document.querySelector('input[name="manejoInventarios"]:checked')?.value;

  if (!clienteSeleccionado) {
    alert("Por favor selecciona un cliente.");
    return;
  }

  const data = {
    Cliente: clienteSeleccionado,
    ModuloCampos: moduloCampos || "",
    ModuloEquipo: moduloEquipo || "",
    RegistrosEquipo: registrosEquipo || "",
    ModuloInsumos: moduloInsumos || "",
    TiposProductos: tiposProductos.join(", ") || "",
    ManejoInventarios: manejoInventarios || ""
  };

  // URL de Google Apps Script
  const scriptURL = "https://script.google.com/macros/s/AKfycbyfP6loLVe51U8J-hUCHmSJ6zVk0RJcz0qyuJZmxlU0Y_oDFYVgwk--98mAJKztZ-N8/exec";

  // Enviar datos mediante fetch
  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (response.ok) {
        alert("Formulario enviado exitosamente.");
        window.location.href = "index.html"; // Regresar a la pantalla 1
      } else {
        alert("Error al enviar el formulario.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Error al enviar el formulario.");
    });
}
