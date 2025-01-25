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

    document.getElementById('nextBtn')?.addEventListener('click', () => {
        const paisSeleccionado = document.getElementById('pais').value;
        if (paisSeleccionado) {
            resetClientes();
            resetPreguntas();
            const clientesOrdenados = (clientesPorPais[paisSeleccionado] || []).sort();
            const clientesDropdown = document.getElementById('clientes');
            if (clientesDropdown) {
                clientesDropdown.innerHTML = '<option value="">Seleccione un cliente</option>';
                clientesOrdenados.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente;
                    option.textContent = cliente;
                    clientesDropdown.appendChild(option);
                });
            }
            switchSection('seccionPais', 'seccionCliente', 'left');
        }
    });
    
    document.getElementById('clientes')?.addEventListener('change', () => {
        const preguntasDiv = document.getElementById('preguntas');
        if (document.getElementById('clientes').value) {
            preguntasDiv.style.display = 'block';
        } else {
            preguntasDiv.style.display = 'none';
        }
    });
    
    document.getElementById('btnVolver')?.addEventListener('click', () => {
        resetPreguntas();
        resetClientes();
        switchSection('seccionCliente', 'seccionPais', 'right');
    });
    
    document.getElementById('btnSiguiente')?.addEventListener('click', () => {
        switchSection('seccionCliente', 'seccionActividades', 'left');
    });
    
    document.getElementById('btnVolverActividades')?.addEventListener('click', () => {
        switchSection('seccionActividades', 'seccionCliente', 'right');
    });
    
    loadCountries();
});
