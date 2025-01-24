// Variables globales
let clientesPorPais = {}; // Objeto para almacenar los clientes por país

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

        // Obtener países y clientes
        const countries = new Set();
        jsonData.slice(1).forEach(row => {
          const country = row[2]; // Columna C: País
          const client = row[1]; // Columna B: Cliente
          if (country && client) {
            countries.add(country);
            if (!clientesPorPais[country]) {
              clientesPorPais[country] = [];
            }
            clientesPorPais[country].push(client);
          }
        });

        // Llenar el dropdown de países
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
    .catch(error => console.error('Error cargando el archivo:', error));
}

// Función para cambiar de sección con efecto de barrido
function switchSection(from, to, direction = 'left') {
  const fromSection = document.getElementById(from);
  const toSection = document.getElementById(to);

  fromSection.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
  fromSection.style.opacity = '0';

  setTimeout(() => {
    fromSection.style.display = 'none';
    toSection.style.display = 'block';
    setTimeout(() => {
      toSection.style.opacity = '1';
      toSection.style.transform = 'translateX(0)';
    }, 50);
  }, 500);
}

// Botón "Siguiente"
document.getElementById('nextBtn').addEventListener('click', () => {
  const paisSeleccionado = document.getElementById('pais').value;
  if (!paisSeleccionado) {
    alert('Por favor, seleccione un país.');
    return;
  }

  // Llenar el dropdown de clientes
  const clientesDropdown = document.getElementById('clientes');
  clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
  clientesPorPais[paisSeleccionado].forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente;
    option.textContent = cliente;
    clientesDropdown.appendChild(option);
  });

  switchSection('seccionPais', 'seccionCliente', 'left');
});

// Botón "Volver"
document.getElementById('backBtn').addEventListener('click', () => {
  document.getElementById('preguntas').style.display = 'none';
  document.getElementById('clientes').value = "";
  switchSection('seccionCliente', 'seccionPais', 'right');
});

// Mostrar preguntas
document.getElementById('clientes').addEventListener('change', () => {
  document.getElementById('preguntas').style.display = 'block';
});

// Inicializar
loadCountries();
