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
    const fakeAgents = generateFakeAgents(5); // Generate 5 fake agents
    let fakeCallIdCounter = 200;

    submitCallBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        const callType = callTypeSelect.value;

        const callId = callIdCounter++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${callId}</td>
            <td>${callType}</td>
            <td>${callType}</td>
            <td>${location ? location : 'Tracing...'}</td>
            <td>
                <button class="view-details-btn" data-call-id="${callId}">View</button>
                <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);

        // Reset inputs
        locationInput.value = '';
        callTypeSelect.value = 'Police';
    });

    const dispatchBtn = document.getElementById('dispatchBtn');
    const dispatchContent = document.getElementById('dispatchContent');
    const agentsList = document.getElementById('agentsList');

    dispatchBtn.addEventListener('click', () => {
        dispatchContent.style.display = 'block';
        mainContent.style.display = 'none';

        // Display agents
        agentsList.innerHTML = '';
        fakeAgents.forEach(agent => {
            const agentDiv = document.createElement('div');
            agentDiv.textContent = `Agent: ${agent.name} (${agent.operatorNumber})`;
            agentsList.appendChild(agentDiv);
        });

        // Add active calls
        const callsDiv = document.createElement('div');
        callsDiv.innerHTML = `<h3>Active Calls</h3>`;
        callsDiv.innerHTML += activeCallsTable.parentElement.innerHTML;
        agentsList.appendChild(callsDiv);
    });

    const homeBtn = document.getElementById('homeBtn');
    homeBtn.addEventListener('click', () => {
        dispatchContent.style.display = 'none';
        mainContent.style.display = 'block';
    });

    activeCallsTable.addEventListener('click', (event) => {
        const callId = event.target.getAttribute('data-call-id');
        
        if (event.target.classList.contains('view-details-btn')) {
            displayCallDetails(callId);
        } else if (event.target.classList.contains('delete-call-btn')) {
            deleteCall(callId);
        }
    });

    function displayCallDetails(callId) {
        const callDetailsSection = document.querySelector('.call-details-section');
        const callMap = document.getElementById('callMap');
        const locationTracing = document.getElementById('locationTracing');

        callDetailsSection.style.display = 'block';
        callMap.style.display = 'none';
        locationTracing.style.display = 'none';

        // Check if location is tracing
        const callRow = document.querySelector(`button[data-call-id="${callId}"]`).closest('tr');
        const locationCell = callRow.children[3];

        if (locationCell.textContent === 'Tracing...') {
            locationTracing.style.display = 'block';

            setTimeout(() => {
                const fakeLocation = getFakeLocation();
                locationCell.textContent = fakeLocation;
                callMap.style.display = 'block';
                locationTracing.style.display = 'none';
                initializeMap(callMap, fakeLocation);
            }, 3000); // Simulate location tracing delay
        } else {
            callMap.style.display = 'block';
            initializeMap(callMap, locationCell.textContent);
        }
    }

    function deleteCall(callId) {
        const callRow = document.querySelector(`button[data-call-id="${callId}"]`).closest('tr');
        callRow.remove();
    }

    function initializeMap(mapElement, location) {
        const map = new google.maps.Map(mapElement, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 }, // Default center to Birmingham, UK
        });

        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: location }, (results, status) => {
            if (status === 'OK') {
                map.setCenter(results[0].geometry.location);
                new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function getFakeLocation() {
        const locations = [
            'Birmingham, UK',
            '123 High St, Birmingham, UK',
            '456 Low St, Birmingham, UK',
            '789 Middle St, Birmingham, UK',
            '101 North St, Birmingham, UK',
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    function generateFakeAgents(count) {
        const agents = [];
        for (let i = 0; i < count; i++) {
            agents.push({
                name: `Agent ${String.fromCharCode(65 + i)}`,
                operatorNumber: `${Math.floor(10000 + Math.random() * 90000)}`,
            });
        }
        return agents;
    }

    // Create a fake call every 30 seconds
    setInterval(() => {
        const agent = fakeAgents[Math.floor(Math.random() * fakeAgents.length)];
        const location = getFakeLocation();
        const callType = ['Police', 'Ambulance', 'Fire'][Math.floor(Math.random() * 3)];

        const callId = fakeCallIdCounter++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${callId}</td>
            <td>${callType}</td>
            <td>${callType}</td>
            <td>${location}</td>
            <td>
                <button class="view-details-btn" data-call-id="${callId}">View</button>
                <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);
    }, 30000);
});
