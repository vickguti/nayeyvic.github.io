document.addEventListener('DOMContentLoaded', async () => {

    const API_URL = 'https://filament-lab-production-fsx5nz.laravel.cloud/api';

    const params = new URLSearchParams(window.location.search);
    const guestCode = params.get('code');

    const guestName = document.getElementById('guest-name');
    const guestsSelect = document.getElementById('guests');

    // Si no existe ?code=...
    if (!guestCode) {
        console.warn('No se encontró el código del invitado en la URL.');
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/guests/${encodeURIComponent(guestCode)}`
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const guest = await response.json();

        console.log('Invitado:', guest);

        // Mostrar nombre
        if (guestName) {
            guestName.textContent = guest.guest_name;
        }

        // Llenar opciones de personas
        if (guestsSelect) {

            guestsSelect.innerHTML = `
                <option value="">Personas confirmadas</option>
            `;

            for (let i = 1; i <= guest.max_guests; i++) {

                const option = document.createElement('option');

                option.value = i;
                option.textContent = `${i} ${i === 1 ? 'persona' : 'personas'}`;

                guestsSelect.appendChild(option);
            }
        }

    } catch (error) {

        console.error('No fue posible obtener la información del invitado:', error);

        if (guestName) {
            guestName.textContent = 'No pudimos cargar la información de tu invitación.';
        }

    }

});