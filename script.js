document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ DOM completamente cargado");

    let clientesPorPais = {}; 

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

    function resetPreguntas() {
        document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        document.querySelectorAll('.dependiente').forEach(pregunta => {
            pregunta.style.display = 'none';
        });
    }

    function resetClientes() {
        const clientesDropdown = document.getElementById('clientes');
        if (clientesDropdown) {
            clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
        }
        document.getElementById('preguntas').style.display = 'none';
    }

    function switchSection(from, to, direction = 'left') {
        const fromSection = document.getElementById(from);
        const toSection = document.getElementById(to);
        if (!fromSection || !toSection) return;

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

    function toggleNavigationButtons(section) {
        const btnVolver = document.getElementById('btnVolver');
        const btnSiguiente = document.getElementById('btnSiguiente');
        
        if (section === 'seccionCliente') {
            btnVolver.style.visibility = 'visible';
            btnSiguiente.style.visibility = 'visible';
        } else {
            btnVolver.style.visibility = 'hidden';
            btnSiguiente.style.visibility = 'hidden';
        }
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
                checkFormCompletion();
            });
        });
    }

    function checkFormCompletion() {
        let allAnswered = true;
        document.querySelectorAll('.pregunta').forEach(pregunta => {
            if (pregunta.style.display !== 'none') {
                const inputs = pregunta.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
                if (inputs.length === 0) {
                    allAnswered = false;
                }
            }
        });
        
        if (!allAnswered) {
            alert("Debe responder todas las preguntas obligatorias antes de continuar.");
        } else {
            switchSection('seccionCliente', 'seccionActividades', 'left');
            toggleNavigationButtons('seccionActividades');
        }
    }

    document.getElementById('btnSiguiente')?.addEventListener('click', checkFormCompletion);
    
    document.getElementById('clientes')?.addEventListener('change', () => {
        document.getElementById('preguntas').style.display = 'block';
        handleDependencias();
    });
    
    document.getElementById('btnVolver')?.addEventListener('click', () => {
        resetPreguntas();
        resetClientes();
        switchSection('seccionCliente', 'seccionPais', 'right');
        toggleNavigationButtons('seccionPais');
    });
    
    document.getElementById('btnVolverActividades')?.addEventListener('click', () => {
        switchSection('seccionActividades', 'seccionCliente', 'right');
        toggleNavigationButtons('seccionCliente');
    });
    
    loadCountries();
    handleDependencias();
});
