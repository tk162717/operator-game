document.addEventListener('DOMContentLoaded', () => {
    const passwordContainer = document.getElementById('passwordContainer');
    const mainContent = document.getElementById('mainContent');
    const dispatchContent = document.getElementById('dispatchContent');
    const passwordInput = document.getElementById('password');
    const passwordBtn = document.getElementById('passwordBtn');
    const errorElement = document.getElementById('error');
    const homeBtn = document.getElementById('homeBtn');
    const dispatchBtn = document.getElementById('dispatchBtn');
    const createCallBtn = document.getElementById('createCallBtn');
    const homeBtnDispatch = document.getElementById('homeBtnDispatch');
    const correctPassword = '1234admin';

    const locationInput = document.getElementById('location');
    const callTypeSelect = document.getElementById('callType');
    const submitCallBtn = document.getElementById('submitCallBtn');
    const activeCallsTable = document.getElementById('activeCallsTable').querySelector('tbody');

    const callDetailsSection = document.getElementById('callDetailsSection');
    const callMap = document.getElementById('callMap');
    const locationTracing = document.getElementById('locationTracing');
    const closeCallDetailsBtn = document.getElementById('closeCallDetailsBtn');

    let callIdCounter = 100;
    const fakeAgents = generateFakeAgents(5); // Generate 5 fake agents
    let fakeCallIdCounter = 200;

    let activeCalls = [];

    passwordBtn.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            passwordContainer.style.display = 'none';
            mainContent.style.display = 'block';
        } else {
            errorElement.textContent = 'Incorrect Password!';
        }
    });

    homeBtn.addEventListener('click', () => {
        mainContent.style.display = 'block';
        dispatchContent.style.display = 'none';
    });

    homeBtnDispatch.addEventListener('click', () => {
        mainContent.style.display = 'block';
        dispatchContent.style.display = 'none';
    });

    dispatchBtn.addEventListener('click', () => {
        dispatchContent.style.display = 'block';
        mainContent.style.display = 'none';

        // Display agents
        displayAgents();
    });

    submitCallBtn.addEventListener('click', () => {
        if (activeCalls.length >= 5) {
            alert("Maximum number of active calls reached.");
            return;
        }

        const location = locationInput.value.trim();
        const callType = callTypeSelect.value;

        const callId = callIdCounter++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${callId}</td>
            <td>${callType}</td>
            <td>${location ? location : 'Tracing...'}</td>
            <td>
                <button class="view-details-btn" data-call-id="${callId}">View</button>
                <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
                <button class="transfer-call-btn" data-call-id="${callId}">Transfer</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);

        activeCalls.push({ id: callId, type: callType, location: location, agent: 'You' });

        // Reset inputs
        locationInput.value = '';
        callTypeSelect.value = 'Police';
    });

    activeCallsTable.addEventListener('click', (event) => {
        const callId = event.target.getAttribute('data-call-id');
        
        if (event.target.classList.contains('view-details-btn')) {
            displayCallDetails(callId);
        } else if (event.target.classList.contains('delete-call-btn')) {
            deleteCall(callId);
        } else if (event.target.classList.contains('transfer-call-btn')) {
            transferCall(callId);
        }
    });

    closeCallDetailsBtn.addEventListener('click', () => {
        callDetailsSection.style.display = 'none';
    });

    function displayCallDetails(callId) {
        callDetailsSection.style.display = 'block';
        callMap.style.display = 'none';
        locationTracing.style.display = 'none';

        const call = activeCalls.find(call => call.id == callId);
        const location = call.location;

        if (location === 'Tracing...') {
            locationTracing.style.display = 'block';
            setTimeout(() => {
                const randomLocation = generateRandomLocation();
                call.location = randomLocation;
                callMap.innerHTML = '';
                const map = new google.maps.Map(callMap, {
                    center: randomLocation,
                    zoom: 14
                });
                new google.maps.Marker({ position: randomLocation, map: map });
                callMap.style.display = 'block';
                locationTracing.style.display = 'none';
            }, 2000);
        } else {
            callMap.innerHTML = '';
            const map = new google.maps.Map(callMap, {
                center: location,
                zoom: 14
            });
            new google.maps.Marker({ position: location, map: map });
            callMap.style.display = 'block';
        }
    }

    function deleteCall(callId) {
        activeCalls = activeCalls.filter(call => call.id != callId);
        document.querySelector(`.delete-call-btn[data-call-id="${callId}"]`).closest('tr').remove();
    }

    function transferCall(callId) {
        const agentId = prompt('Enter agent ID to transfer to:');
        if (agentId) {
            const call = activeCalls.find(call => call.id == callId);
            call.agent = `Agent ${agentId}`;
            alert(`Call ${callId} transferred to Agent ${agentId}`);
            deleteCall(callId);
            displayAgents();
        }
    }

    function displayAgents() {
        const agentsList = document.getElementById('agentsList');
        agentsList.innerHTML = '';

        fakeAgents.forEach(agent => {
            const agentDiv = document.createElement('div');
            agentDiv.innerHTML = `
                <strong>${agent.name}</strong> (ID: ${agent.id})
                <ul id="agentCalls${agent.id}"></ul>
            `;
            agentsList.appendChild(agentDiv);
        });

        activeCalls.forEach(call => {
            if (call.agent !== 'You') {
                const agentCallsList = document.getElementById(`agentCalls${call.agent.split(' ')[1]}`);
                const callItem = document.createElement('li');
                callItem.textContent = `Call ${call.id}: ${call.type}, ${call.location}`;
                agentCallsList.appendChild(callItem);
            }
        });
    }

    function generateFakeAgents(count) {
        const agents = [];
        for (let i = 1; i <= count; i++) {
            agents.push({ id: i.toString().padStart(5, '0'), name: `Agent ${i}` });
        }
        return agents;
    }

    function generateRandomLocation() {
        const lat = 52.4862 + (Math.random() - 0.5) * 0.01;
        const lng = -1.8904 + (Math.random() - 0.5) * 0.01;
        return { lat: lat, lng: lng };
    }

    setInterval(() => {
        if (activeCalls.length < 5) {
            const callId = fakeCallIdCounter++;
            const callType = ['Police', 'Ambulance', 'Fire'][Math.floor(Math.random() * 3)];
            const location = generateRandomLocation();
            const agent = fakeAgents[Math.floor(Math.random() * fakeAgents.length)];

            activeCalls.push({ id: callId, type: callType, location: location, agent: agent.name });

            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${callId}</td>
                <td>${callType}</td>
                <td>${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</td>
                <td>
                    <button class="view-details-btn" data-call-id="${callId}">View</button>
                    <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
                    <button class="transfer-call-btn" data-call-id="${callId}">Transfer</button>
                </td>
            `;
            activeCallsTable.appendChild(newRow);
        }
    }, 30000);
});
