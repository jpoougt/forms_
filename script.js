document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    // Variables globales
    let clientesPorPais = {}; // Objeto para almacenar los clientes por país

    // Cargar países desde el archivo Excel y ordenarlos alfabéticamente
    function loadCountries() {
        fetch('SondeoClientes.xlsx')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                console.log("Archivo cargado correctamente");
                return response.blob();
            })
            .then(blob => {
                console.log("Archivo leído como blob:", blob);
                const reader = new FileReader();
                reader.onload = function (e) {
                    console.log("Archivo procesado en FileReader");
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    console.log("Workbook leído:", workbook);

                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    console.log("Datos convertidos a JSON:", jsonData);

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

                    // Convertir a array y ordenar alfabéticamente
                    const sortedCountries = [...countries].sort();

                    // Llenar el dropdown de países ordenado
                    const paisDropdown = document.getElementById('pais');
                    paisDropdown.innerHTML = '<option value="">Seleccione su país...</option>'; // Resetear opciones
                    sortedCountries.forEach(country => {
                        const option = document.createElement('option');
                        option.value = country;
                        option.textContent = country;
                        paisDropdown.appendChild(option);
                    });

                    console.log("Países agregados al dropdown:", sortedCountries);
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(error => console.error('Error cargando el archivo:', error));
    }

    // Función para cambiar de sección con efecto de barrido
    function switchSection(from, to, direction = 'left') {
        const fromSection = document.getElementById(from);
        const toSection = document.getElementById(to);
        const backButton = document.getElementById('backBtn');

        fromSection.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        fromSection.style.opacity = '0';

        setTimeout(() => {
            fromSection.style.display = 'none';
            toSection.style.display = 'block';

            // Mostrar u ocultar el botón "Volver" solo en la selección de clientes
            if (to === 'seccionCliente') {
                backButton.style.display = 'flex';
            } else {
                backButton.style.display = 'none';
            }

            setTimeout(() => {
                toSection.style.opacity = '1';
                toSection.style.transform = 'translateX(0)';
            }, 50);
        }, 500);
    }

    // Verificar que los botones existen antes de asignar eventos
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('btnVolver');
    const siguienteBtn = document.getElementById('btnSiguiente');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const paisSeleccionado = document.getElementById('pais').value;
            if (!paisSeleccionado) {
                alert('Por favor, seleccione un país.');
                return;
            }

            // Obtener la lista de clientes y ordenarlos alfabéticamente
            const clientesOrdenados = (clientesPorPais[paisSeleccionado] || []).sort();

            // Llenar el dropdown de clientes ordenados
            const clientesDropdown = document.getElementById('clientes');
            clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
            clientesOrdenados.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente;
                option.textContent = cliente;
                clientesDropdown.appendChild(option);
            });

            switchSection('seccionPais', 'seccionCliente', 'left');
        });
    } else {
        console.error("❌ nextBtn no encontrado");
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            // Ocultar todas las preguntas y reiniciar respuestas
            document.getElementById('preguntas').style.display = 'none';
            document.getElementById('clientes').value = "";
            document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
                input.checked = false;
            });

            // Ocultar preguntas dependientes
            document.querySelectorAll('.dependiente').forEach(pregunta => {
                pregunta.style.display = 'none';
            });

            switchSection('seccionCliente', 'seccionPais', 'right');
        });
    } else {
        console.error("❌ btnVolver no encontrado");
    }

    if (siguienteBtn) {
        siguienteBtn.addEventListener('click', () => {
            alert("🚧 Sección en construcción. Pronto podrás continuar.");
        });
    } else {
        console.error("❌ btnSiguiente no encontrado");
    }

    // Cargar países al iniciar
    loadCountries();
});
