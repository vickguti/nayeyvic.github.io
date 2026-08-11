document.addEventListener('DOMContentLoaded', async () => {

    const API_URL = 'https://filament-lab-production-fsx5nz.laravel.cloud/api';

    const rsvpSection = document.getElementById('rsvp');
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpFields = document.getElementById('rsvp_fields');
    const rsvpConfirmed = document.getElementById('rsvp-confirmed');
    const rsvpError = document.getElementById('rsvp-error');

    const guestName = document.getElementById('guest-name');
    const guestsSelect = document.getElementById('guests');
    const submitButton = document.getElementById('rsvp-submit');

    const params = new URLSearchParams(window.location.search);
    const guestCode = params.get('code');


    // =====================================================
    // SIN CÓDIGO
    // =====================================================

    if (!guestCode) {
        console.warn('No se encontró el código del invitado en la URL.');
        return;
    }


    // =====================================================
    // OBTENER INVITADO
    // =====================================================

    try {

        const response = await fetch(
            `${API_URL}/guests/${encodeURIComponent(guestCode)}`
        );

        // Código inválido
        if (!response.ok) {
            console.warn(`Invitado no encontrado. HTTP ${response.status}`);
            return;
        }

        const guest = await response.json();

        console.log('Invitado:', guest);


        // =================================================
        // INVITADO YA CONFIRMÓ
        // =================================================

        if (guest.confirmed) {

            rsvpSection.style.display = '';
            rsvpForm.style.display = 'none';
            rsvpConfirmed.style.display = '';

            return;
        }


        // =================================================
        // INVITADO SIN CONFIRMAR
        // =================================================

        guestName.textContent = guest.guest_name;


        // Llenar opciones de personas
        guestsSelect.innerHTML = `
            <option value="">Personas confirmadas</option>
        `;

        for (let i = 1; i <= guest.max_guests; i++) {

            const option = document.createElement('option');

            option.value = i;
            option.textContent =
                `${i} ${i === 1 ? 'persona' : 'personas'}`;

            guestsSelect.appendChild(option);
        }


        // Mostrar RSVP
        rsvpSection.style.display = '';
        rsvpForm.style.display = '';
        rsvpConfirmed.style.display = 'none';


        // =================================================
        // ENVIAR RSVP
        // =================================================

        rsvpForm.addEventListener('submit', async (event) => {

            event.preventDefault();

            const confirmedGuests = Number(guestsSelect.value);

            if (!confirmedGuests) {
                return;
            }


            // Ocultar error anterior
            rsvpError.style.display = 'none';


            // Deshabilitar botón
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


                // =============================================
                // CONFIRMACIÓN EXITOSA
                // =============================================

                rsvpForm.style.display = 'none';
                rsvpConfirmed.style.display = '';


            } catch (error) {

                console.error(
                    'Error al confirmar asistencia:',
                    error
                );

                submitButton.disabled = false;
                submitButton.value = 'Confirmar asistencia';


                rsvpError.textContent =
                    'No fue posible registrar tu confirmación. Por favor, inténtalo nuevamente.';

                rsvpError.style.display = '';

            }

        });


    } catch (error) {

        console.error(
            'No fue posible obtener la información del invitado:',
            error
        );

        rsvpSection.style.display = 'none';
    }

});