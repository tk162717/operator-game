document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('loginContainer');
    const mainContainer = document.getElementById('mainContainer');
    const userIdInput = document.getElementById('userId');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const homeBtn = document.getElementById('homeBtn');
    const dispatchBtn = document.getElementById('dispatchBtn');
    const createCallBtn = document.getElementById('createCallBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const homeContent = document.getElementById('homeContent');
    const dispatchContent = document.getElementById('dispatchContent');
    const locationInput = document.getElementById('location');
    const callTypeSelect = document.getElementById('callType');
    const submitCallBtn = document.getElementById('submitCallBtn');
    const activeCallsTable = document.getElementById('activeCallsTable').querySelector('tbody');
    const callDetailsSection = document.getElementById('callDetailsSection');
    const callMap = document.getElementById('callMap');
    const locationTracing = document.getElementById('locationTracing');
    const closeCallDetailsBtn = document.getElementById('closeCallDetailsBtn');
    const createCallSection = document.getElementById('createCallSection');
    const createCallMapElement = document.getElementById('createCallMap');
    const newCallLocation = document.getElementById('newCallLocation');
    const newCallType = document.getElementById('newCallType');
    const submitNewCallBtn = document.getElementById('submitNewCallBtn');
    const agentsList = document.getElementById('agentsList');

    let callIdCounter = 100;
    let activeCalls = [];
    let operators = [];
    let currentUser = null;

    async function loadOperators() {
        const response = await fetch('operators.json');
        operators = await response.json();
    }

    loadOperators();

    loginBtn.addEventListener('click', () => {
        const userId = userIdInput.value.trim();
        const password = passwordInput.value.trim();
        const user = operators.find(op => op.id === userId && op.password === password);
        if (user) {
            currentUser = user;
            loginContainer.style.display = 'none';
            mainContainer.style.display = 'block';
        } else {
            loginError.textContent = 'Invalid User ID or Password';
        }
    });

    homeBtn.addEventListener('click', () => {
        homeContent.style.display = 'block';
        dispatchContent.style.display = 'none';
    });

    dispatchBtn.addEventListener('click', () => {
        homeContent.style.display = 'none';
        dispatchContent.style.display = 'block';
        displayAgents();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        loginContainer.style.display = 'flex';
        mainContainer.style.display = 'none';
    });

    createCallBtn.addEventListener('click', () => {
        createCallSection.style.display = 'block';
        const createCallMap = new google.maps.Map(createCallMapElement, {
            center: { lat: 52.4862, lng: -1.8904 },
            zoom: 14
        });

        createCallMap.addListener('click', (event) => {
            new google.maps.Marker({
                position: event.latLng,
                map: createCallMap
            });
            const latLng = event.latLng;
            newCallLocation.value = `${latLng.lat()}, ${latLng.lng()}`;
        });
    });

    submitNewCallBtn.addEventListener('click', () => {
        const location = newCallLocation.value.trim();
        const callType = newCallType.value;
        const callId = callIdCounter++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${callId}</td>
            <td>${callType}</td>
            <td>${location}</td>
            <td>
                <button class="view-details-btn" data-call-id="${callId}">View</button>
                <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
                <button class="transfer-call-btn" data-call-id="${callId}">Transfer</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);
        activeCalls.push({ id: callId, type: callType, location, notes: '', operator: currentUser.name });
        createCallSection.style.display = 'none';
    });

    submitCallBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        const callType = callTypeSelect.value;
        const callId = callIdCounter++;
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${callId}</td>
            <td>${callType}</td>
            <td>${location}</td>
            <td>
                <button class="view-details-btn" data-call-id="${callId}">View</button>
                <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
                <button class="transfer-call-btn" data-call-id="${callId}">Transfer</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);
        activeCalls.push({ id: callId, type: callType, location, notes: '', operator: currentUser.name });
    });

    activeCallsTable.addEventListener('click', (event) => {
        const target = event.target;
        const callId = parseInt(target.getAttribute('data-call-id'));
        if (target.classList.contains('view-details-btn')) {
            showCallDetails(callId);
        } else if (target.classList.contains('delete-call-btn')) {
            deleteCall(callId);
        } else if (target.classList.contains('transfer-call-btn')) {
            transferCall(callId);
        }
    });

    function displayAgents() {
        agentsList.innerHTML = '';
        operators.forEach(op => {
            if (op.id !== currentUser.id) {
                const agentDiv = document.createElement('div');
                agentDiv.innerHTML = `Agent: ${op.name} (ID: ${op.id})`;
                agentsList.appendChild(agentDiv);
            }
        });
    }

    function generateRandomLocation() {
        const locations = [
            { lat: 52.4862, lng: -1.8904 },
            { lat: 52.5096, lng: -1.8840 },
            { lat: 52.4508, lng: -1.8737 }
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    function showCallDetails(callId) {
        const call = activeCalls.find(c => c.id === callId);
        if (call) {
            locationTracing.style.display = 'block';
            callDetailsSection.style.display = 'block';
            setTimeout(() => {
                locationTracing.style.display = 'none';
                callMap.innerHTML = '';
                const map = new google.maps.Map(callMap, {
                    center: generateRandomLocation(),
                    zoom: 14
                });
                new google.maps.Marker({
                    position: generateRandomLocation(),
                    map: map
                });
            }, 20000);
        }
    }

    function deleteCall(callId) {
        activeCalls = activeCalls.filter(call => call.id !== callId);
        const row = activeCallsTable.querySelector(`button[data-call-id="${callId}"]`).parentNode.parentNode;
        row.parentNode.removeChild(row);
    }

    function transferCall(callId) {
        const agents = operators.filter(op => op.id !== currentUser.id);
        const agent = agents[Math.floor(Math.random() * agents.length)];
        alert(`Call ${callId} transferred to Agent: ${agent.name}`);
        activeCalls = activeCalls.filter(call => call.id !== callId);
        const row = activeCallsTable.querySelector(`button[data-call-id="${callId}"]`).parentNode.parentNode;
        row.parentNode.removeChild(row);
    }

    closeCallDetailsBtn.addEventListener('click', () => {
        callDetailsSection.style.display = 'none';
    });

    setInterval(() => {
        if (activeCalls.length < 5) {
            const callId = callIdCounter++;
            const randomLocation = generateRandomLocation();
            const callType = ['Police', 'Ambulance', 'Fire'][Math.floor(Math.random() * 3)];
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${callId}</td>
                <td>${callType}</td>
                <td>${randomLocation.lat}, ${randomLocation.lng}</td>
                <td>
                    <button class="view-details-btn" data-call-id="${callId}">View</button>
                    <button class="delete-call-btn" data-call-id="${callId}">Delete</button>
                    <button class="transfer-call-btn" data-call-id="${callId}">Transfer</button>
                </td>
            `;
            activeCallsTable.appendChild(newRow);
            activeCalls.push({ id: callId, type: callType, location: `${randomLocation.lat}, ${randomLocation.lng}`, notes: '', operator: 'Other Agent' });
        }
    },
