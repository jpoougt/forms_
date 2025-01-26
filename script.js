document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    let clientesPorPais = {}; 
    let seccionActual = "seccionPais"; // Variable para rastrear la sección actual

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
                        console.log("🌍 Países cargados correctamente", sortedCountries);
                    }
                };
                reader.readAsArrayBuffer(blob);
            })
            .catch(error => console.error('❌ Error cargando el archivo:', error));
    }

    function resetPreguntas() {
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        document.querySelectorAll('.dependiente').forEach(pregunta => {
            pregunta.style.display = 'none';
        });
    }

    function handleDependencias() {
        document.querySelectorAll('.pregunta input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => {
                const dependencias = {
                    "pregunta2": "pregunta2_1",
                    "pregunta3": ["pregunta3_1", "pregunta3_2"],
                    "pregunta4": ["pregunta4_1", "pregunta4_2"],
                    "pregunta6": "pregunta6_1"
                };
                
                Object.keys(dependencias).forEach(pregunta => {
                    const seleccion = document.querySelector(`input[name="${pregunta}"]:checked`);
                    const dependientes = Array.isArray(dependencias[pregunta]) ? dependencias[pregunta] : [dependencias[pregunta]];
                    
                    if (seleccion && seleccion.value === "si") {
                        dependientes.forEach(id => document.getElementById(id).style.display = 'block');
                    } else {
                        dependientes.forEach(id => {
                            document.getElementById(id).style.display = 'none';
                            document.querySelectorAll(`#${id} input`).forEach(input => input.checked = false);
                        });
                    }
                });
            });
        });
    }

    function loadClientsByCountry(paisSeleccionado) {
        const clientesDropdown = document.getElementById('clientes');
        if (clientesDropdown) {
            clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
            if (clientesPorPais[paisSeleccionado]) {
                clientesPorPais[paisSeleccionado].forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente;
                    option.textContent = cliente;
                    clientesDropdown.appendChild(option);
                });
                console.log("👥 Clientes cargados para:", paisSeleccionado, clientesPorPais[paisSeleccionado]);
            }
        }
    }

    function switchSection(from, to) {
        document.getElementById(from).style.display = 'none';
        document.getElementById(to).style.display = 'block';
        seccionActual = to;
    }

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        const paisSeleccionado = document.getElementById('pais').value;
        if (paisSeleccionado) {
            resetPreguntas();
            loadClientsByCountry(paisSeleccionado);
            switchSection('seccionPais', 'seccionCliente');
            seccionActual = "seccionCliente";
            handleDependencias();
        } else {
            alert("Debe seleccionar un país antes de continuar.");
        }
    });

    document.getElementById('clientes')?.addEventListener('change', () => {
        document.getElementById('preguntas').style.display = 'block';
        handleDependencias();
    });
    
    document.getElementById('btnVolver')?.addEventListener('click', () => {
        if (seccionActual === 'seccionCliente') {
            resetPreguntas();
            switchSection('seccionCliente', 'seccionPais');
            seccionActual = "seccionPais";
        } else if (seccionActual === 'seccionActividades') {
            resetPreguntas();
            document.getElementById('preguntas').style.display = 'none';
            switchSection('seccionActividades', 'seccionCliente');
            seccionActual = "seccionCliente";
        }
    });
    
    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        if (seccionActual === 'seccionCliente') {
            let allAnswered = true;
            document.querySelectorAll('#seccionCliente .pregunta').forEach(pregunta => {
                if (pregunta.style.display !== 'none') {
                    const inputs = pregunta.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
                    if (inputs.length === 0) {
                        alert(`Debe responder la pregunta: "${pregunta.querySelector('p').innerText}"`);
                        allAnswered = false;
                    }
                }
            });
            if (allAnswered) {
                switchSection('seccionCliente', 'seccionActividades');
                seccionActual = "seccionActividades";
            }
        }
    });
    
    loadCountries();
    handleDependencias();
});
