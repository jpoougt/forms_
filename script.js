// Cargar países desde el archivo Excel
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

        // Extraer Países (Columna "C") sin encabezado
        const countries = new Set();
        jsonData.slice(1).forEach(row => {
          const country = row[2]; // Columna C
          if (country) countries.add(country);
        });

        populateDropdown('#pais', Array.from(countries));
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(err => console.error('Error al cargar el archivo:', err));
}

// Cargar clientes con base en el país seleccionado
function loadClientsForCountry(selectedCountry) {
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

        // Filtrar clientes por país (Columnas B y C)
        const clients = jsonData
          .slice(1)
          .filter(row => row[2] === selectedCountry) // Columna C es el país
          .map(row => row[1]); // Columna B es el cliente

        populateDropdown('#cliente', clients);
      };
      reader.readAsArrayBuffer(blob);
    })
    .catch(err => console.error('Error al cargar los clientes:', err));
}

// Poblar dropdown genérico
function populateDropdown(selector, items) {
  const dropdown = document.querySelector(selector);
  dropdown.innerHTML = '<option value="">Seleccione una opción</option>';
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}

// Manejar transición a la siguiente sección
function transitionToSection(currentSection, nextSection) {
  const current = document.querySelector(currentSection);
  const next = document.querySelector(nextSection);

  current.classList.add('slide-out-left');
  current.addEventListener('animationend', () => {
    current.style.display = 'none';
    next.style.display = 'block';
    next.classList.add('slide-in-right');
  }, { once: true });
}

// Eventos del DOM
document.addEventListener('DOMContentLoaded', () => {
  loadCountries();

  // Evento para cargar clientes cuando se selecciona un país
  document.querySelector('#pais').addEventListener('change', event => {
    const selectedCountry = event.target.value;
    if (selectedCountry) {
      loadClientsForCountry(selectedCountry);
    }
  });

  // Evento para manejar el botón "Siguiente"
  document.querySelector('#btnSiguiente').addEventListener('click', () => {
    transitionToSection('#paisSelection', '#preguntasSection');
  });
});
