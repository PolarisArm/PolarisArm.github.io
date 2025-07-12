

document.addEventListener('DOMContentLoaded', () => {

      const firebaseConfig = {
    apiKey: "AIzaSyAoPtIwjG3v9Qphd6fOnKwaYS3jLIVYTww",
    authDomain: "esp32iottest-bf0fc.firebaseapp.com",
    databaseURL: "https://esp32iottest-bf0fc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "esp32iottest-bf0fc",
    storageBucket: "esp32iottest-bf0fc.firebasestorage.app",
    messagingSenderId: "769603524787",
    appId: "1:769603524787:web:34b1dcea99188c2355f8c6"
  };

  firebase.initializeApp(firebaseConfig);

 const database = firebase.database();

 firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html'; // or whatever you name your login page
  }
  // If user is logged in, continue with your existing code
});
/*  const email = "abc121@gmail.com";
const password = "12389652369";



// Auto-login logic
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    loginForm.style.display = "none";
    dashboard.style.display = "block";
  } else {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        loginForm.style.display = "none";
        dashboard.style.display = "block";
      })
      .catch((error) => {
        alert("Auto-login failed: " + error.message);
        loginForm.style.display = "block";
      });
  }
}); */

    // Write to Sensor
  

   
    var websocket;
    let temperature = 0, rpm = 0, PF = 0;
    let PV1 = 0, PV2 = 0, PV3 = 0;
    let PI1 = 0, PI2 = 0, PI3 = 0;
    var VIB_X = 0;

    const NORMAL_VOLT = 220;
    const UNDER_VOLT = 200;
    const OVER_VOLT = 250;
    const OVER_CURRENT = 5000;// mA

    var slider_two, slider_three = 0;

    const buffer = [];
    const fftBuffer = [];
    const bufferInterval = 1000; // 50ms buffer interval
    const vibBufferInterval = 250; // 50ms buffer interval


    var maxDatapoint = 400;

    var vfd_forward = document.getElementById("vfd_forward");
    var vfd_reverse = document.getElementById("vfd_reverse");

    var motorSlider = document.getElementById("motorSpeed_slider");

    var star_delta_forward = document.getElementById("star_delta_forward");
    var star_delta_reverse = document.getElementById("star_delta_reverse");

    var manual_or_vfd_sel = document.getElementById("manual_or_vfd_select");



    var star_delta_forward_value = star_delta_forward.value;
    var star_delta_reverse_value = star_delta_reverse.value;
    var manual_or_vfd_sel_value = manual_or_vfd_sel.value;
    var vfd_forward_value = vfd_forward.value;
    var vfd_reverse_value = vfd_reverse.value;
    var slider_one_value = motorSlider.value;

    var pf_gauge = document.querySelector(".circular_pf");
    var pf_value = document.querySelector(".pf_val");

    var rpm_gauge = document.querySelector(".circular_rpm");
    var rmp_value = document.querySelector(".rpm_val");
    var temp_gauge = document.querySelector(".circular_temp");
    var temp_value = document.querySelector(".temp_val");

    var phase_one_volt = document.querySelector(".voltage_value_1");
    var phase_one_current = document.querySelector(".current_value_1");

    var phase_two_volt = document.querySelector(".voltage_value_2");
    var phase_two_current = document.querySelector(".current_value_2");

    var phase_three_volt = document.querySelector(".voltage_value_3");
    var phase_three_current = document.querySelector(".current_value_3");
    var logOutbutton = document.getElementById("logoutButton");

    const ctx = document.getElementById('graphing').getContext('2d');

    var darkmode = document.getElementById('darkmodeButton');
    
    darkModetoggle();
    
    darkmode.onclick = () => {

        if (darkmode.value === "0") {
            darkmode.value = "1";
            localStorage.setItem('DARKMODE', '1')

            const allElements = (document.body.querySelectorAll('*'));

            const allClass = new Set();
            document.body.classList.add('darkmode');

            allElements.forEach(element => {
                element.classList.add('darkmode');
                element.classList.forEach(cls => {
                    allClass.add(cls);
                });
            });
            console.log(allClass);
        }
        else if (darkmode.value === "1") {
            // Turn dark mode off
            darkmode.value = "0";
            localStorage.setItem('DARKMODE', '0')

            // Remove the 'darkmode' class from all elements
            document.body.classList.remove('darkmode');
            const allElements = document.body.querySelectorAll('*');
            allElements.forEach(element => {
                element.classList.remove('darkmode');
            });

        }
    }

    function darkModetoggle() {
        if (localStorage.getItem('DARKMODE') === '1') {
            const allElements = (document.body.querySelectorAll('*'));

            const allClass = new Set();
            document.body.classList.add('darkmode');

            allElements.forEach(element => {
                element.classList.add('darkmode');
                element.classList.forEach(cls => {
                    allClass.add(cls);
                });
            });

        }
        else if (localStorage.getItem('DARKMODE') === '0') {
            // Remove the 'darkmode' class from all elements
            document.body.classList.remove('darkmode');
            const allElements = document.body.querySelectorAll('*');
            allElements.forEach(element => {
                element.classList.remove('darkmode');
            });
        }
    }

            // Add this to your existing app.js file

        // Account dropdown functionality
        let currentUserEmail = null;

        // Update the auth state change listener to include email display
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                // User is logged in
                currentUserEmail = user.email;
                updateAccountDisplay(user.email);
            } else {
                // User is not logged in, redirect to login
                window.location.href = 'login.html';
            }
        });

        // Function to update account display
        function updateAccountDisplay(email) {
            const userEmailSpan = document.getElementById('userEmail');
            const dropdownEmail = document.getElementById('dropdownEmail');
            
            if (userEmailSpan && dropdownEmail) {
                // Show first part of email for the main display
                const emailPart = email.split('@')[0];
                userEmailSpan.textContent = emailPart.length > 12 ? emailPart.substring(0, 12) + '...' : emailPart;
                
                // Show full email in dropdown
                dropdownEmail.textContent = email;
            }
        }

// Dropdown toggle functionality
        document.addEventListener('click', function(e) {
            const accountLink = document.getElementById('accountLink');
            const dropdownMenu = document.getElementById('dropdownMenu');
            const accountDropdown = document.querySelector('.account-dropdown');
            
            if (accountLink && accountLink.contains(e.target)) {
                e.preventDefault();
                
                // Toggle dropdown
                if (dropdownMenu.classList.contains('show')) {
                    dropdownMenu.classList.remove('show');
                    accountDropdown.classList.remove('active');
                } else {
                    dropdownMenu.classList.add('show');
                    accountDropdown.classList.add('active');
                }
            } else {
                // Close dropdown if clicked outside
                if (dropdownMenu) {
                    dropdownMenu.classList.remove('show');
                    if (accountDropdown) {
                        accountDropdown.classList.remove('active');
                    }
                }
            }
        });

// Logout function
logOutbutton.onclick = () =>  {
    firebase.auth().signOut().then(() => {
        console.log('User signed out');
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Logout failed. Please try again.');
    });
}

    vfd_forward.disabled = true;
    vfd_reverse.disabled = true;
    motorSlider.disabled = true;

   
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Time labels
            datasets: [
                {
                    label: "VIBRATION FFT",
                    data: [],
                    borderColor: 'rgb(75,192,192)',
                    backgroundColor: "rgba(75,192,192,0.2)",
                    pointStyle: 'circle',
                    hoverRadius: 20,

                    tension: 0.1,
                    fill: true,
                    spanGaps: true, // Enables spanning gaps for this dataset
                    pointRadius: 0,
                    hoverPointRadius: 0

                }

            ]
        },
        options: {
             responsive: true,
                maintainAspectRatio: false,
                hitRadius:30,
                
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Frequency (Hz)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Magnitude'
                        },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Real-time FFT Spectrum'
                    }
                },
                animation: {
                    duration: 0 // Disable animation for real-time updates
                }
            }           

    });



    readSwitchData();
    readSensorData();
    readFFTData();
 // Read from Switch
    function readSwitchData() {
      database.ref('Switch/SDR').on('value', (snapshot) => {
        const data = parseInt(snapshot.val());
        star_delta_reverse.innerHTML = data ===  1 ? "SDR ON" : "SDR OFF";
        star_delta_reverse.value = data ===  1 ? 1 : 0;
        if (star_delta_reverse.value == 1) { star_delta_forward.disabled = true; }
        else { star_delta_forward.disabled = false; }
        console.log("Switch status SDR:", data);
      });

      database.ref('Switch/SDF').on('value', (snapshot) => {
        const data = parseInt(snapshot.val());
        star_delta_forward.innerHTML = data === 1 ? "SDF ON" : "SDF OFF";
        star_delta_forward.value = data === 1 ? 1 : 0;

        if (star_delta_forward.value == 1) { star_delta_reverse.disabled = true; }
        else { star_delta_reverse.disabled = false; }
        console.log("Switch status SDF:", data);
      });

      database.ref('Switch/MOVF').on('value', (snapshot) => {
        const data = snapshot.val();
        manual_or_vfd_sel.innerHTML = data === 1 ? "VFD" : "MANUAL";
        manual_or_vfd_sel.value = data ===  1 ? 1 : 0;

            if (manual_or_vfd_sel.value === "0") {
                vfd_forward.innerHTML = "VF OFF";
                vfd_forward.value = "0";
                vfd_reverse.innerHTML ="VR OFF";
                vfd_reverse.value = "0";
                motorSlider.value = 0;
                document.getElementById("rangeValue").innerHTML = motorSlider.value;
                slider_one_value = motorSlider.value;

                vfd_forward.disabled = true;
                vfd_reverse.disabled = true;
                motorSlider.disabled = true;
                star_delta_forward.disabled = false;
                star_delta_reverse.disabled = false;
                
                console.log("STAR DELTA");
            }
            else {
                star_delta_reverse.innerHTML = "SDR OFF";
                star_delta_reverse.value = "0";
                star_delta_forward.innerHTML = "SDF OFF";
                star_delta_forward.value = "0";
                star_delta_forward.disabled = true;
                star_delta_reverse.disabled = true;
                vfd_forward.disabled = false;
                vfd_reverse.disabled = false;
                motorSlider.disabled = false;
               
                console.log("VFD");
            }
        
        console.log("Switch status MOVF:", data);
      });
    }


    function readSensorData() {
    // Temperature
    firebase.database().ref('Sensor/Temp').on('value', (snapshot) => {
        temperature = parseInt(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    // RPM
    firebase.database().ref('Sensor/RPM').on('value', (snapshot) => {
        rpm = parseInt(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    // Power Factor (PF)
    firebase.database().ref('Sensor/PF').on('value', (snapshot) => {
        PF = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    firebase.database().ref('Sensor/PV1').on('value', (snapshot) => {
        PV1 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });
    
    firebase.database().ref('Sensor/PV2').on('value', (snapshot) => {
        PV2 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });
    
    firebase.database().ref('Sensor/PV3').on('value', (snapshot) => {
        PV3 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    firebase.database().ref('Sensor/PI1').on('value', (snapshot) => {
        PI1 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    firebase.database().ref('Sensor/PI2').on('value', (snapshot) => {
        PI2 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });

    firebase.database().ref('Sensor/PI3').on('value', (snapshot) => {
        PI3 = parseFloat(snapshot.val()) || 0;
        updateAllValue(temperature, rpm, PF, PV1, PI1, PV2, PI2, PV3, PI3);
    });
    // ... Repeat for PV1, PV2, PI1, etc.
}


    function updateAllValue(TEMP_VAL, RPM_VAL,PF_VAL, P1V, P1I, P2V, P2I, P3V, P3I) {
        var RPMVAL_CHANGE = RPM_VAL;
        var RPM_DIR = " OFF";

        phase_one_current.innerHTML = P1I.toFixed(2);
        phase_two_current.innerHTML = P2I.toFixed(2);
        phase_three_current.innerHTML = P3I.toFixed(2);

        phase_one_volt.innerHTML = Math.round(P1V);
        phase_two_volt.innerHTML = Math.round(P2V);
        phase_three_volt.innerHTML = Math.round(P3V);
        PF_VAL = Math.abs(PF_VAL);
        if(PF_VAL != 0.00 && PF_VAL <= 1.00){
            pf_gauge.style.setProperty("--percentage_pf",PF_VAL);
            pf_value.innerHTML = PF_VAL;

        }
       

        if(RPMVAL_CHANGE < 0){
            RPMVAL_CHANGE = RPMVAL_CHANGE*(-1);
            RPM_DIR = " R";
        }else if(RPMVAL_CHANGE > 0){
            RPM_DIR = " F";
        }
        

       
      /*   const angle = Math.round(mapping(RPMVAL_CHANGE, 0, 1000, -90, 90));
        rpm_gauge.style.setProperty("--percentage_rpm", angle);

        rmp_value.innerHTML = RPM_VAL + RPM_DIR; // Assuming both are strings or convertible


       /*  rpm_gauge.style.setProperty("--percentage_rpm", Math.round(mapping(RPMVAL_CHANGE, 0, 1000, 0, 180)));
        rmp_value.innerHTML = RPM_VAL+RPM_DIR; */

        /*temp_gauge.style.setProperty("--percentage_temp", Math.round(mapping(TEMP_VAL, 0, 100, -90, 90)));
        temp_value.innerHTML = TEMP_VAL;*/

         let rpmAngle = mapping(RPM_VAL, 0, 3000, -45, 135);
    rpm_gauge.style.setProperty("--angle_rpm", `${rpmAngle}deg`);
    rmp_value.innerHTML = `${RPM_VAL} ${RPM_VAL > 0 ? "F" : RPM_VAL < 0 ? "R" : "OFF"}`;

    // Update TEMP rotation (0 to 180 mapped to -90 to +90 degrees)
    let tempAngle = mapping(TEMP_VAL, 0, 180, -45,135);
    temp_gauge.style.setProperty("--angle_temp", `${tempAngle}deg`);
    temp_value.innerHTML = `${TEMP_VAL}`;

        updateCircleStatus("circle1", P1V);
        updateCircleStatus("circle2", P2V);
        updateCircleStatus("circle3", P3V);

        // Current Status
        updateCurrentStatus("circle4", P1I);
        updateCurrentStatus("circle5", P2I);
        updateCurrentStatus("circle6", P3I);
    }



    function mapping(value, inputMin, inputMax, outputMin, outputMax) {
        return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;

    }

    
    function updateCircleStatus(circleId, voltage) {
        const circle = document.getElementById(circleId);
        circle.classList.remove("normal", "overvoltage", "undervoltage");

        if (voltage < UNDER_VOLT) {
            circle.classList.add("undervoltage");
        } else if (voltage > OVER_VOLT) {
            circle.classList.add("overvoltage");
        } else {
            circle.classList.add("normal");
        }
    }

    // Handle Current Circle Status
    function updateCurrentStatus(circleId, current) {
        const circle = document.getElementById(circleId);
        circle.classList.remove("normal", "overcurrent");

        if (current > OVER_CURRENT) {
            circle.classList.add("overcurrent");
        } else {
            circle.classList.add("normal");
        }
    }
    vfd_forward.onclick = () => {
        toggleVfdButtons("vfd_forward");

    }

    vfd_reverse.onclick = () => {
        toggleVfdButtons("vfd_reverse");

    }


    star_delta_forward.onclick = () => {
        toggleStarDeltaButtons("star_delta_forward");

    }

    star_delta_reverse.onclick = () => {
        toggleStarDeltaButtons("star_delta_reverse");

    }




    function toggleVfdButtons(button) {
        if (button === "vfd_forward") {
            if (vfd_reverse.value == 0) {
                vfd_reverse.disabled = true;
                if (vfd_forward.value == 0) {
                    vfd_forward.value = 1;
                    vfd_forward_value = vfd_forward.value;
                    vfd_forward.innerHTML = "VF ON";
                    database.ref('Switch/VF').set(1);

                    console.log("HE");
                }
                else {
                    vfd_forward.value = 0;
                    vfd_forward_value = vfd_forward.value;
                    vfd_forward.innerHTML = "VF OFF";
                    vfd_reverse.disabled = false;
                    database.ref('Switch/VF').set(0);


                }
            }
            else {
                alert("FIRST TURN OFF THE REVERSE");
            }
        }

        if (button === "vfd_reverse") {

            if (vfd_forward.value == 0) {
                vfd_forward.disabled = true;
                if (vfd_reverse.value == 0) {
                    vfd_reverse.value = 1;
                    vfd_reverse_value = vfd_reverse.value;
                    vfd_reverse.innerHTML = "VR ON";
                    database.ref('Switch/VR').set(1);

                }
                else {
                    vfd_reverse.value = 0;
                    vfd_reverse_value = vfd_reverse.value;
                    vfd_reverse.innerHTML = "VR OFF";
                    vfd_forward.disabled = false;
                    database.ref('Switch/VR').set(0);

                }
            }
            else {
                alert("FIRST TURN OFF THE FORWARD");
            }
        }

    }



    function toggleStarDeltaButtons(button) {

        if (button === "star_delta_forward") {
            if (star_delta_reverse.value == 0) {
                star_delta_reverse.disabled = true;
                if (star_delta_forward.value == 0) {
                    star_delta_forward.value = 1;
                    star_delta_forward_value = star_delta_forward.value;
                    star_delta_forward.innerHTML = "SDF ON";
                    database.ref('Switch/SDF').set(1);

                    console.log("HE");
                }
                else {
                    star_delta_forward.value = 0;
                    star_delta_forward_value = star_delta_forward.value;
                    star_delta_forward.innerHTML = "SDF OFF";
                    database.ref('Switch/SDF').set(0);
                    star_delta_reverse.disabled = false;

                }
            }
            else {
                alert("FIRST TURN OFF THE REVERSE");
            }
        }

        if (button === "star_delta_reverse") {

            if (star_delta_forward.value == 0) {
                star_delta_forward.disabled = true;
                if (star_delta_reverse.value == 0) {
                    star_delta_reverse.value = 1;
                    star_delta_reverse_value = star_delta_reverse.value;
                    star_delta_reverse.innerHTML = "SDR ON";
                    database.ref('Switch/SDR').set(1);

                }
                else {
                    star_delta_reverse.value = 0;
                    star_delta_reverse_value = star_delta_reverse.value;
                    star_delta_reverse.innerHTML = "SDR OFF";
                    database.ref('Switch/SDR').set(0);
                    star_delta_forward.disabled = false;

                }
            }
            else {
                alert("FIRST TURN OFF THE FORWARD");
            }
        }
    }




    manual_or_vfd_sel.onclick = () => {
        if (manual_or_vfd_sel.value == 1) {
            manual_or_vfd_sel.value = 0;
            manual_or_vfd_sel_value = manual_or_vfd_sel.value;
            manual_or_vfd_sel.innerHTML = "MANUAL";
            database.ref('Switch/MOVF').set(0);

           
        } else {
            manual_or_vfd_sel.value = 1;
            manual_or_vfd_sel_value = manual_or_vfd_sel.value;
            manual_or_vfd_sel.innerHTML = "VFD";
            database.ref('Switch/MOVF').set(1);

        }

        toggleManualOrVFD();
    }

    function toggleManualOrVFD() {
        if (manual_or_vfd_sel.value == 1) { // VFD selected
            vfd_forward.disabled = false;
            vfd_reverse.disabled = false;
            motorSlider.disabled = false;
            star_delta_forward.value = 0;
            star_delta_reverse.value = 0;
            star_delta_forward.innerHTML = "SDF OFF";
            star_delta_reverse.innerHTML = "SDR OFF";
            database.ref('Switch/SDR').set(0);
            database.ref('Switch/SDF').set(0);


            star_delta_forward.disabled = true;
            star_delta_reverse.disabled = true;
            console.log("True");
        } else { // MANUAL selected
            vfd_forward.value = 0;
            vfd_reverse.value = 0;
            vfd_forward.innerHTML = "VF OFF";
            vfd_reverse.innerHTML = "VR OFF";
            vfd_forward.disabled = true;
            vfd_reverse.disabled = true;
            motorSlider.innerHTML = 0;

            motorSlider.value  = 0;
            motorSlider.disabled = true;
            document.getElementById("rangeValue").innerHTML = motorSlider.value;
            star_delta_forward.disabled = false;
            star_delta_reverse.disabled = false;
            database.ref('Switch/VF').set(0);
            database.ref('Switch/VR').set(0);

        }

    }

    motorSlider.oninput = () => {
        document.getElementById("rangeValue").innerHTML = motorSlider.value;
        database.ref('Switch/VSlider').set(motorSlider.value);

    }
    motorSlider.onchange = () => {
        slider_one_value = motorSlider.value;
    }




function readFFTData() {
    const fftRef = database.ref('FFT');
    
    fftRef.on('value', (snapshot) => {
        const fftData = snapshot.val();
        if (fftData) {
            console.log("New FFT data received from Firebase");
            processFFTData(fftData);
        } else {
            console.log("No FFT data available");
        }
    }, (error) => {
        console.error("Firebase read error:", error);
    });
}

// Function 2: Process FFT data
function processFFTData(fftData) {
    try {
        if (!fftData || !fftData.frequency || !fftData.magnitude) {
            console.error("Invalid FFT data structure:", fftData);
            return;
        }

        // Convert Firebase objects to arrays
        const frequencies = [];
        const magnitudes = [];
        
        // Firebase stores as objects with numeric keys "0", "1", "2", etc.
        const freqKeys = Object.keys(fftData.frequency).sort((a, b) => parseInt(a) - parseInt(b));
        const magKeys = Object.keys(fftData.magnitude).sort((a, b) => parseInt(a) - parseInt(b));
        
        // Ensure we have matching frequency and magnitude data
        const dataLength = Math.min(freqKeys.length, magKeys.length);
        
        for (let i = 0; i < dataLength; i++) {
            frequencies.push(fftData.frequency[freqKeys[i]]);
            magnitudes.push(fftData.magnitude[magKeys[i]]);
        }
        
        if (frequencies.length > 0 && magnitudes.length > 0) {
            console.log("Valid FFT data processed:", frequencies.length, "points");
            console.log("Frequency range:", frequencies[0], "Hz to", frequencies[frequencies.length - 1], "Hz");
            
            // Update chart with processed data
            updateFFTChart(frequencies, magnitudes);
        } else {
            console.error("No valid FFT data found");
        }
        
    } catch (error) {
        console.error("Error processing FFT data:", error);
    }
}

// Function 3: Update FFT chart
function updateFFTChart(frequencies, magnitudes) {
    console.log("Updating FFT chart with", frequencies.length, "data points");
    
    // Update chart data
    myChart.data.labels = frequencies;
    myChart.data.datasets[0].data = magnitudes;
    myChart.update('none'); // 'none' mode for fastest updates
}

});
