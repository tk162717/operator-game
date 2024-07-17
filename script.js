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

    const addressInput = document.getElementById('address');
    const searchBtn = document.getElementById('searchBtn');
    const loadingBar = document.getElementById('loadingBar');
    const map = document.getElementById('map');
    const sendUnitsBtn = document.getElementById('sendUnitsBtn');

    let loadingTimeout;

    const searchAddress = () => {
        clearTimeout(loadingTimeout);
        loadingBar.style.display = 'block';
        map.src = "about:blank"; // Reset map src

        loadingTimeout = setTimeout(() => {
            if (!addressInput.value) {
                // Generate a random location within Birmingham, UK
                const birminghamLat = 52.4862;
                const birminghamLong = -1.8904;
                const randomLat = birminghamLat + (Math.random() - 0.5) * 0.1;
                const randomLong = birminghamLong + (Math.random() - 0.5) * 0.1;
                map.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyDot98cx3Hx197MvTvvBaShWMmza-d9A4k&center=${randomLat},${randomLong}&zoom=15`;
                loadingBar.style.display = 'none';
            }
        }, 20000); // 20 seconds

        // Simulate loading bar
        setTimeout(() => {
            loadingBar.style.display = 'none';
            if (addressInput.value) {
                map.src = `https://www.google.com/maps/embed/v1/search?key=AIzaSyDot98cx3Hx197MvTvvBaShWMmza-d9A4k&q=${encodeURIComponent(addressInput.value)},Birmingham,UK`;
            }
        }, 3000); // Simulated search time
    };

    searchBtn.addEventListener('click', searchAddress);

    addressInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchAddress();
        }
    });

    sendUnitsBtn.addEventListener('click', () => {
        const units = [];
        if (document.getElementById('fireUnit').checked) units.push('Fire');
        if (document.getElementById('policeUnit').checked) units.push('Police');
        if (document.getElementById('ambulanceUnit').checked) units.push('Ambulance');
        alert(`Units Sent: ${units.join(', ')}`);
    });
});
