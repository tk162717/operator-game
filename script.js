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
    const closeCallDetailsBtn = document.getElementById('closeCallDetailsBtn');
    const createCallSection = document.getElementById('createCallSection');
    const createCallMapElement = document.getElementById('createCallMap');
    const newCallLocation = document.getElementById('newCallLocation');
    const newCallType = document.getElementById('newCallType');
    const newCallNotes = document.getElementById('newCallNotes');
    const submitNewCallBtn = document.getElementById('submitNewCallBtn');
    const quickCallLocation = document.getElementById('quickCallLocation');
    const quickCallSubmit = document.getElementById('quickCallSubmit');
    const findLocationBtn = document.getElementById('findLocationBtn');
    const agentsList = document.getElementById('agentsList');
    const addNotesBtn = document.getElementById('addNotesBtn');
    const callNotes = document.getElementById('callNotes');

    let callIdCounter = 100;
    let activeCalls = [];
    let operators = [
        { id: '78789', password: 'admin78789', name: 'Admin' },
        { id: '12345', password: 'password123', name: 'Operator 1' },
        { id: '67890', password: 'password456', name: 'Operator 2' }
    ];
    let currentUser = null;
    let callMapInstance, createCallMapInstance;

    loginBtn.addEventListener('click', login);
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (loginContainer.style.display !== 'none') login();
            else if (document.activeElement === quickCallLocation) quickCallSubmit.click();
            else if (document.activeElement === newCallLocation || document.activeElement === newCallType || document.activeElement === newCallNotes) submitNewCallBtn.click();
        }
    });

    function login() {
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
    }

    homeBtn.addEventListener('click', () => {
        homeContent.style.display = 'block';
        dispatchContent.style.display = 'none';
        createCallSection.style.display = 'none';
        callDetailsSection.style.display = 'none';
    });

    dispatchBtn.addEventListener('click', () => {
        homeContent.style.display = 'none';
        dispatchContent.style.display = 'block';
        createCallSection.style.display = 'none';
        callDetailsSection.style.display = 'none';
        displayAgents();
    });

    createCallBtn.addEventListener('click', () => {
        homeContent.style.display = 'none';
        dispatchContent.style.display = 'none';
        createCallSection.style.display = 'block';
        callDetailsSection.style.display = 'none';
        initCreateCallMap();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        loginContainer.style.display = 'block';
        mainContainer.style.display = 'none';
        userIdInput.value = '';
        passwordInput.value = '';
    });

    quickCallSubmit.addEventListener('click', () => {
        handleQuickCall();
    });

    findLocationBtn.addEventListener('click', () => {
        findLocation(newCallLocation.value, createCallMapInstance);
    });

    submitNewCallBtn.addEventListener('click', () => {
        handleCreateCall();
    });

    function handleQuickCall() {
        const location = quickCallLocation.value.trim();
        const callId = callIdCounter++;
        if (!location) {
            showLoadingBar(() => {
                const randomLocation = getRandomLocation();
                addCallToTable(callId, 'Quick Call', randomLocation);
            });
        } else {
            addCallToTable(callId, 'Quick Call', location);
        }
        quickCallLocation.value = '';
    }

    function handleCreateCall() {
        const location = newCallLocation.value.trim();
        const type = newCallType.value;
        const notes = newCallNotes.value.trim();
        const callId = callIdCounter++;
        if (!location) {
            showLoadingBar(() => {
                const randomLocation = getRandomLocation();
                addCallToTable(callId, type, randomLocation, notes);
            });
        } else {
            findLocation(location, createCallMapInstance, () => {
                addCallToTable(callId, type, location, notes);
            });
        }
        newCallLocation.value = '';
        newCallNotes.value = '';
        createCallSection.style.display = 'none';
        homeContent.style.display = 'block';
    }

    function addCallToTable(id, type, location, notes = '') {
        if (activeCalls.length >= 5) return;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${id}</td>
            <td>${type}</td>
            <td>${location}</td>
            <td>
                <button onclick="viewCallDetails(${id})">View</button>
                <button onclick="transferCall(${id})">Transfer</button>
                <button onclick="deleteCall(${id})">Delete</button>
            </td>
        `;
        activeCalls.push({ id, type, location, notes });
        activeCallsTable.appendChild(row);
    }

    function viewCallDetails(id) {
        const call = activeCalls.find(c => c.id === id);
        if (!call) return;
        homeContent.style.display = 'none';
        dispatchContent.style.display = 'none';
        createCallSection.style.display = 'none';
        callDetailsSection.style.display = 'block';
        callNotes.value = call.notes;
        callDetailsSection.dataset.callId = id;
        initCallMap(call.location);
    }

    function transferCall(id) {
        const call = activeCalls.find(c => c.id === id);
        if (!call) return;

        const agentId = prompt('Enter the Agent ID to transfer the call to:');
        if (agentId && operators.find(op => op.id === agentId)) {
            alert(`Call ${id} transferred to Agent ${agentId}`);
        } else {
            alert('Invalid Agent ID');
        }
    }

    function deleteCall(id) {
        const index = activeCalls.findIndex(c => c.id === id);
        if (index === -1) return;
        activeCalls.splice(index, 1);
        activeCallsTable.deleteRow(index);
    }

    function showLoadingBar(callback) {
        const loadingBar = document.createElement('div');
        loadingBar.textContent = 'Localizing caller location...';
        loadingBar.style.backgroundColor = '#555';
        loadingBar.style.padding = '10px';
        loadingBar.style.margin = '10px';
        loadingBar.style.color = '#fff';
        mainContainer.appendChild(loadingBar);
        setTimeout(() => {
            mainContainer.removeChild(loadingBar);
            callback();
        }, 20000);
    }

    function getRandomLocation() {
        const locations = [
            'Birmingham, UK',
            'Sutton Coldfield, UK',
            'Coventry, UK',
            'Wolverhampton, UK',
            'Leicester, UK'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    function findLocation(address, mapInstance, callback) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                mapInstance.setCenter(location);
                new google.maps.Marker({
                    map: mapInstance,
                    position: location
                });
                if (callback) callback();
            }
        });
    }

    function initCallMap(location) {
        callMapInstance = new google.maps.Map(callMap, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 } // Birmingham, UK
        });
        findLocation(location, callMapInstance);
    }

       function initCallMap(location) {
        callMapInstance = new google.maps.Map(callMap, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 } // Birmingham, UK
        });
        findLocation(location, callMapInstance);
    }

    function initCreateCallMap() {
        createCallMapInstance = new google.maps.Map(createCallMapElement, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 } // Birmingham, UK
        });
    }

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

    addNotesBtn.addEventListener('click', () => {
        const callId = callDetailsSection.dataset.callId;
        const call = activeCalls.find(c => c.id === callId);
        if (call) {
            call.notes = callNotes.value;
            alert('Notes updated successfully. Shared with units.');
        }
    });

    closeCallDetailsBtn.addEventListener('click', () => {
        callDetailsSection.style.display = 'none';
        homeContent.style.display = 'block';
    });

    function showLoadingBar(callback) {
        const loadingBar = document.createElement('div');
        loadingBar.textContent = 'Localizing caller location...';
        loadingBar.style.backgroundColor = '#555';
        loadingBar.style.padding = '10px';
        loadingBar.style.margin = '10px';
        loadingBar.style.color = '#fff';
        mainContainer.appendChild(loadingBar);
        setTimeout(() => {
            mainContainer.removeChild(loadingBar);
            callback();
        }, 20000);
    }

    function getRandomLocation() {
        const locations = [
            'Birmingham, UK',
            'Sutton Coldfield, UK',
            'Coventry, UK',
            'Wolverhampton, UK',
            'Leicester, UK'
        ];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    function findLocation(address, mapInstance, callback) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ 'address': address }, (results, status) => {
            if (status === 'OK') {
                const location = results[0].geometry.location;
                mapInstance.setCenter(location);
                new google.maps.Marker({
                    map: mapInstance,
                    position: location
                });
                if (callback) callback();
            }
        });
    }

    function initCallMap(location) {
        callMapInstance = new google.maps.Map(callMap, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 } // Birmingham, UK
        });
        findLocation(location, callMapInstance);
    }

    function initCreateCallMap() {
        createCallMapInstance = new google.maps.Map(createCallMapElement, {
            zoom: 12,
            center: { lat: 52.4862, lng: -1.8904 } // Birmingham, UK
        });
    }

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

    function handleLoginEnterKey(e) {
        if (e.key === 'Enter') login();
    }

    function handleQuickCallEnterKey(e) {
        if (e.key === 'Enter' && document.activeElement === quickCallLocation) {
            quickCallSubmit.click();
        }
    }

    function handleCreateCallEnterKey(e) {
        if (e.key === 'Enter' && (document.activeElement === newCallLocation || document.activeElement === newCallType || document.activeElement === newCallNotes)) {
            submitNewCallBtn.click();
        }
    }

    document.addEventListener('keypress', handleLoginEnterKey);
    document.addEventListener('keypress', handleQuickCallEnterKey);
    document.addEventListener('keypress', handleCreateCallEnterKey);
});
