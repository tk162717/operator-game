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

    function displayAgents() {
        agentsList.innerHTML = '';
        operators.forEach(operator => {
            if (operator.id !== currentUser.id) {
                const agentDiv = document.createElement('div');
                agentDiv.textContent = `${operator.name} (${operator.id})`;
                agentsList.appendChild(agentDiv);
            }
        });
    }

    activeCallsTable.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-details-btn')) {
            const callId = event.target.dataset.callId;
            viewCallDetails(callId);
        } else if (event.target.classList.contains('delete-call-btn')) {
            const callId = event.target.dataset.callId;
            deleteCall(callId);
        } else if (event.target.classList.contains('transfer-call-btn')) {
            const callId = event.target.dataset.callId;
            transferCall(callId);
        }
    });

    function viewCallDetails(callId) {
        const call = activeCalls.find(c => c.id == callId);
        if (call) {
            callDetailsSection.style.display = 'block';
            homeContent.style.display = 'none';
            const callLatLng = call.location.split(', ').map(Number);
            const callLocation = new google.maps.LatLng(callLatLng[0], callLatLng[1]);
            const callMapInstance = new google.maps.Map(callMap, {
                center: callLocation,
                zoom: 14
            });
            new google.maps.Marker({
                position: callLocation,
                map: callMapInstance
            });
        }
    }

    closeCallDetailsBtn.addEventListener('click', () => {
        callDetailsSection.style.display = 'none';
        homeContent.style.display = 'block';
    });

    function deleteCall(callId) {
        activeCalls = activeCalls.filter(c => c.id != callId);
        const row = document.querySelector(`.delete-call-btn[data-call-id="${callId}"]`).closest('tr');
        row.remove();
    }

    function transferCall(callId) {
        // Implement transfer call functionality here
    }

    setInterval(generateFakeCall, 30000);

    function generateFakeCall() {
        if (activeCalls.length >= 5) return;
        const fakeCallId = callIdCounter++;
        const fakeCall = {
            id: fakeCallId,
            type: ['Police', 'Ambulance', 'Fire'][Math.floor(Math.random() * 3)],
            location: `${52.4862 + (Math.random() - 0.5) / 1000}, ${-1.8904 + (Math.random() - 0.5) / 1000}`,
            notes: '',
            operator: `Agent ${Math.floor(Math.random() * 100000)}`
        };
        activeCalls.push(fakeCall);
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${fakeCall.id}</td>
            <td>${fakeCall.type}</td>
            <td>${fakeCall.location}</td>
            <td>
                <button class="view-details-btn" data-call-id="${fakeCall.id}">View</button>
                <button class="delete-call-btn" data-call-id="${fakeCall.id}">Delete</button>
                <button class="transfer-call-btn" data-call-id="${fakeCall.id}">Transfer</button>
            </td>
        `;
        activeCallsTable.appendChild(newRow);
    }
});
