document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    let clientesPorPais = {}; // Objeto para almacenar los clientes por país

    function loadCountries() {
        fetch('SondeoClientes.xlsx')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    const countries = new Set();
                    jsonData.slice(1).forEach(row => {
                        const country = row[2];
                        const client = row[1];
                        if (country && client) {
                            countries.add(country);
                            if (!clientesPorPais[country]) {
                                clientesPorPais[country] = [];
                            }
                            clientesPorPais[country].push(client);
                        }
                    });

                    const sortedCountries = [...countries].sort();
                    const paisDropdown = document.getElementById('pais');
                    if (paisDropdown) {
                        paisDropdown.innerHTML = '<option value="">Seleccione su país...</option>';
                        sortedCountries.forEach(country => {
                            const option = document.createElement('option');
                            option.value = country;
                            option.textContent = country;
                            paisDropdown.appendChild(option);
                        });
                    }
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(error => console.error('Error cargando el archivo:', error));
    }

    function switchSection(from, to, direction = 'left') {
        const fromSection = document.getElementById(from);
        const toSection = document.getElementById(to);
        const backButton = document.getElementById('btnVolver');

        if (!fromSection || !toSection) {
            console.error(`❌ No se encontró la sección: ${from} o ${to}`);
            return;
        }

        fromSection.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        fromSection.style.opacity = '0';

        setTimeout(() => {
            fromSection.style.display = 'none';
            toSection.style.display = 'block';

            backButton.style.visibility = (to === 'seccionCliente' || to === 'seccionActividades') ? 'visible' : 'hidden';

            const siguienteBtn = document.getElementById("btnSiguiente");
            if (siguienteBtn) {
                siguienteBtn.style.visibility = (to === "seccionCliente") ? "visible" : "hidden";
            }

            setTimeout(() => {
                toSection.style.opacity = '1';
                toSection.style.transform = 'translateX(0)';
            }, 50);
        }, 500);
    }

    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('btnVolver');
    const siguienteBtn = document.getElementById('btnSiguiente');
    const clientesDropdown = document.getElementById('clientes');
    const preguntasDiv = document.getElementById('preguntas');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const paisSeleccionado = document.getElementById('pais').value;
            if (!paisSeleccionado) {
                alert('Por favor, seleccione un país.');
                return;
            }

            const clientesOrdenados = (clientesPorPais[paisSeleccionado] || []).sort();

            if (clientesDropdown) {
                clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
                clientesOrdenados.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente;
                    option.textContent = cliente;
                    clientesDropdown.appendChild(option);
                });
                clientesDropdown.style.display = 'block';
                preguntasDiv.style.display = 'none';
            }

            switchSection('seccionPais', 'seccionCliente', 'left');
        });
    }

    if (clientesDropdown) {
        clientesDropdown.addEventListener('change', () => {
            if (clientesDropdown.value) {
                preguntasDiv.style.display = 'block';
            } else {
                preguntasDiv.style.display = 'none';
            }
        });
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchSection('seccionCliente', 'seccionPais', 'right');
        });
    }

    if (siguienteBtn) {
        siguienteBtn.addEventListener('click', () => {
            switchSection('seccionCliente', 'seccionActividades', 'left');
        });
    }

    const btnVolverActividades = document.getElementById('btnVolverActividades');
    if (btnVolverActividades) {
        btnVolverActividades.addEventListener('click', () => {
            switchSection('seccionActividades', 'seccionCliente', 'right');
        });
    }

    document.querySelectorAll('.pregunta input').forEach(input => {
        input.addEventListener('change', () => {
            let todasRespondidas = true;
            document.querySelectorAll('.pregunta').forEach(pregunta => {
                if (!pregunta.querySelector('input:checked') && pregunta.style.display !== 'none') {
                    todasRespondidas = false;
                }
            });
            siguienteBtn.disabled = !todasRespondidas;
        });
    });

    loadCountries();
});
