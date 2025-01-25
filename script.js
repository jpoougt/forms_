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

    function validarRespuestas() {
        let allAnswered = true;
        let mensaje = "Faltan respuestas en las siguientes preguntas:\n";
        
        document.querySelectorAll('.pregunta').forEach(pregunta => {
            if (pregunta.style.display !== 'none' && pregunta.offsetParent !== null) {
                const inputs = pregunta.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
                if (inputs.length === 0) {
                    allAnswered = false;
                    mensaje += `- ${pregunta.querySelector('p').textContent}\n`;
                }
            }
        });
        
        if (!allAnswered) {
            alert(mensaje);
            return false;
        }
        return true;
    }

    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        if (validarRespuestas()) {
            switchSection('seccionCliente', 'seccionActividades', 'left');
            toggleNavigationButtons('seccionActividades');
        }
    });

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        const paisSeleccionado = document.getElementById('pais').value;
        if (paisSeleccionado) {
            resetPreguntas();
            switchSection('seccionPais', 'seccionCliente', 'left');
            toggleNavigationButtons('seccionCliente');
            handleDependencias();
        }
    });

    document.getElementById('clientes')?.addEventListener('change', () => {
        document.getElementById('preguntas').style.display = 'block';
        handleDependencias();
    });
    
    document.getElementById('btnVolver')?.addEventListener('click', () => {
        resetPreguntas();
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
