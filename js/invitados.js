document.addEventListener('DOMContentLoaded', async () => {

    const API_URL = 'https://filament-lab-production-fsx5nz.laravel.cloud/api';

    const rsvpSection = document.getElementById('rsvp');
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

        //INVITADO YA CONFIRMADO
        if (guest.confirmed) {
            document.getElementById('rsvp-fields').style.display = 'none';
            document.getElementById('rsvp-message').style.display = '';
            return;
        }

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

            rsvpSection.style.display = '';
        }

    } catch (error) {

        console.error('No fue posible obtener la información del invitado:', error);

        if (guestName) {
            guestName.textContent = 'No pudimos cargar la información de tu invitación.';
        }

        rsvpSection.style.display = 'none';

    }


    //

    const rsvpForm = document.getElementById('rsvp-form');

    rsvpForm.addEventListener('submit', async (event) => {

        event.preventDefault();

        const confirmedGuests = Number(guestsSelect.value);

        if (!confirmedGuests) {
            return;
        }

        const submitButton = document.getElementById('rsvp-submit');

        submitButton.disabled = true;
        submitButton.value = 'Enviando...';

        try {

            const response = await fetch(
                `${API_URL}/guests/${encodeURIComponent(guestCode)}/rsvp`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },

                    body: JSON.stringify({
                        confirmed_guests: confirmedGuests
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || `Error HTTP ${response.status}`
                );
            }

            console.log('RSVP registrado:', data);

            // Ocultar formulario
            document.getElementById('rsvp-fields').style.display = 'none';

            // Mostrar mensaje de confirmación
            const rsvpMessage = document.getElementById('rsvp-message');

            rsvpMessage.textContent =
                'Ya recibimos tu confirmación de asistencia.';

            rsvpMessage.style.display = '';

        } catch (error) {

            console.error('Error al confirmar asistencia:', error);

            submitButton.disabled = false;
            submitButton.value = 'Confirmar asistencia';

            alert(
                'No fue posible registrar tu confirmación. Por favor, inténtalo nuevamente.'
            );
        }

    });

});