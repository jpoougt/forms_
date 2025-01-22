// Función para cargar el archivo Excel y extraer los países en index.html
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
        const countries = new Set();
        jsonData.forEach(row => {
          if (row[2]) {
            countries.add(row[2].trim());
          }
        });

        // Agregar los países al dropdown
        const countrySelect = document.getElementById("pais");
        countries.forEach(country => {
          const option = document.createElement("option");
          option.value = country;
          option.textContent = country;
          countrySelect.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(err => console.error("Error al cargar el archivo Excel:", err));
}

// Guardar el país seleccionado en localStorage y redirigir a formulario.html
function btn_siguiente() {
  const selectedCountry = document.getElementById("pais").value;
  if (!selectedCountry) {
    alert("Por favor, seleccione un país.");
    return;
  }
  localStorage.setItem("selectedCountry", selectedCountry);
  window.location.href = "formulario.html";
}

// Cargar los clientes del país seleccionado en formulario.html
function loadClients() {
  const selectedCountry = localStorage.getItem("selectedCountry");
  if (!selectedCountry) {
    alert("No se seleccionó ningún país. Redirigiendo...");
    window.location.href = "index.html";
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

        // Filtrar los clientes por país (Columna B: Cliente, Columna C: País)
        const clients = [];
        jsonData.forEach(row => {
          if (row[2] && row[2].trim() === selectedCountry) {
            clients.push(row[1]); // Columna B: Cliente
          }
        });

        // Agregar los clientes al dropdown
        const clientSelect = document.getElementById("clientes");
        clients.forEach(client => {
          const option = document.createElement("option");
          option.value = client;
          option.textContent = client;
          clientSelect.appendChild(option);
        });
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(err => console.error("Error al cargar los clientes:", err));
}
