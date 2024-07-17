document.addEventListener('DOMContentLoaded', () => {
    const passwordContainer = document.getElementById('passwordContainer');
    const mainContent = document.getElementById('mainContent');
    const passwordInput = document.getElementById('password');
    const passwordBtn = document.getElementById('passwordBtn');
    const errorElement = document.getElementById('error');

    const correctPassword = '1234admin';

    passwordBtn.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            passwordContainer.style.display = 'none';
            mainContent.style.display = 'block';
        } else {
            errorElement.textContent = 'Incorrect Password!';
        }
    });

    const locationInput = document.getElementById('location');
    const callTypeSelect = document.getElementById('callType');
    const submitCallBtn = document.getElementById('submitCallBtn');
    const activeCallsTable = document.getElementById('activeCallsTable').querySelector('tbody');

    let callIdCounter = 100;

    submitCallBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        const callType = callTypeSelect.value;
        
        if (location) {
            const callId = callIdCounter++;
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${callId}</td>
                <td>${callType}</td>
                <td>${callType}</td>
                <td>${location}</td>
            `;

            newRow.addEventListener('click', () => {
                displayCallDetails(callId, location, callType);
            });

            activeCallsTable.appendChild(newRow);

            locationInput.value = '';
            callTypeSelect.value = 'Police';
        }
    });

    const displayCallDetails = (callId, location, callType) => {
        const callDetailsSection = document.querySelector('.call-details-section');
        const callMap = document.getElementById('callMap');
        const callNotes = document.getElementById('callNotes');
        const saveNotesBtn = document.getElementById('saveNotesBtn');

        callDetailsSection.style.display = 'block';
        callMap.innerHTML = `<iframe width="100%" height="100%" frameborder="0" style="border:0"
            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyDot98cx3Hx197MvTvvBaShWMmza-d9A4k
            &q=${encodeURIComponent(location)}" allowfullscreen></iframe>`;

        saveNotesBtn.onclick = () => {
            alert(`Notes for call ID ${callId} saved: ${callNotes.value}`);
        };
    };
});
