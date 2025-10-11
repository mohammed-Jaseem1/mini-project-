/*
 * ESP32 Live Gas Monitor (Cleaned and Refactored for Wokwi)
 *
 * Description:
 * This firmware connects to a Node.js backend running on the host machine from within the Wokwi simulator.
 * 1.  It connects directly to the Wokwi Gateway to find the server, avoiding unreliable network scans.
 * 2.  It fetches the initial gas level for the specified user ID from the server.
 * 3.  It simulates gas consumption over time, reducing the level locally.
 * 4.  It saves the new gas level to the database periodically.
 * 5.  It simulates a gas leak by triggering an alarm when the gas level drops below a
 *     randomly selected threshold, significantly increasing the consumption rate.
 * 6.  It sends alarm data to the server if the gas is low (<20%) OR if a leak is detected.
 * 7.  All serial logs are verbose for clear monitoring and debugging.
 */

#include <WiFi.h>
#include <HTTPClient.h>

// =================================================================
// --- USER CONFIGURATION ---
// =================================================================
// Target user for monitoring. Get this from your database or admin panel.
String userId = "68ea9193340d01efb6ec24c5";

// --- WiFi Configuration ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// --- Server Configuration ---
// Special hostname provided by Wokwi to connect to the computer running the simulation.
// This is the most reliable method.
const char* wokwiHost = "host.wokwi.internal";

// If the wokwi hostname fails, this fallback IP will be used.
// Find your computer's local IP address (e.g., ipconfig/ifconfig) and enter it here.
String fallbackServerIP = "192.168.103.252";
const int serverPort = 5000;

// =================================================================
// --- GLOBAL VARIABLES & CONSTANTS ---
// =================================================================

// --- Server & API ---
String serverIP = "";       // Discovered or fallback server IP
String serverUrl = "";      // URL for sending alarm/sensor data
String consumptionUrl = ""; // URL for saving gas level
String getUserUrl = "";     // URL for fetching user data

// --- Hardware Pins ---
const int gasSensorAnalogPin = 32;
const int gasSensorDigitalPin = 33;
const int ledPin = 21;
const int buzzerPin = 22;

// --- Gas Monitoring & Simulation ---
float userGasLevel = 0.0;           // Current gas level in the tank (%)
float lastSavedGasLevel = 0.0;      // Tracks the last level saved to the DB to reduce updates
const int lowGasThreshold = 20;     // Threshold for "Low Gas" alarm

// --- Consumption Rates ---
const float gasConsumptionRate = 0.5;     // Normal consumption: 0.5% per second
const float gasLeakConsumptionRate = 2.5; // Leak consumption: 2.5% per second (5x faster)

// --- Leak Simulation ---
float leakTriggerLevel = 0.0;       // Gas level at which the simulated leak will start
bool simulatedLeakActive = false;   // Flag to indicate if the leak simulation is active

// --- Timers & State Management ---
unsigned long lastDBFetch = 0;
const unsigned long dbFetchInterval = 10000; // Fetch data every 10 seconds to sync
const float gasUpdateThreshold = 2.0;       // Save to DB only after a 2% change
bool dbFetched = false;                     // Flag to ensure initial data is fetched before starting

// =================================================================
// --- FORWARD DECLARATIONS ---
// =================================================================
void initializeServerUrls();
void fetchUserGasLevel();

// =================================================================
// --- SERVER & NETWORK FUNCTIONS ---
// =================================================================

/**
 * @brief Sets up the global API URL strings once the server IP is known.
 */
void initializeServerUrls() {
    if (serverIP.length() > 0) {
        String baseUrl = "http://" + serverIP + ":" + String(serverPort);
        serverUrl = baseUrl + "/api/gas/sensor";
        consumptionUrl = baseUrl + "/api/gas/consumption";
        getUserUrl = baseUrl + "/api/gas/user/";

        Serial.println("[CONFIG] Server URLs configured:");
        Serial.println("  Base URL: " + baseUrl);
    }
}

/**
 * @brief Main function to establish a connection to the server.
 *        It first tries the Wokwi hostname, then uses the hardcoded fallback IP.
 */
void initializeServerConnection() {
    Serial.println("[SERVER] Trying to connect via Wokwi hostname: " + String(wokwiHost));
    
    // The Wokwi hostname directly maps to the host machine's IP.
    // This is the most reliable way to connect from the simulation.
    serverIP = wokwiHost;
    initializeServerUrls();

    // Test the connection to confirm the server is running
    HTTPClient http;
    if (http.begin(getUserUrl + userId)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode > 0) {
            Serial.println("[SUCCESS] Connected to server via Wokwi hostname. Server responded with code: " + String(httpCode));
            http.end();
            return; // Success!
        }
        http.end();
    }
    
    Serial.println("[FALLBACK] Wokwi hostname failed. Trying user-defined fallback IP: " + fallbackServerIP);
    serverIP = fallbackServerIP;
    initializeServerUrls();

    if (http.begin(getUserUrl + userId)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode > 0) {
            Serial.println("[SUCCESS] Connected to server via fallback IP. Server responded with code: " + String(httpCode));
        } else {
            Serial.println("[ERROR] Fallback IP also failed. Check your Node.js server and firewall settings.");
            serverIP = ""; // Clear IP to retry later
        }
        http.end();
    }
}


// =================================================================
// --- DATABASE INTERACTION FUNCTIONS ---
// =================================================================

/**
 * @brief Sends an alarm/status update to the server.
 * @param currentGasLevel The current gas level.
 * @param digitalValue The digital sensor reading (0=OK, 1=Leak).
 */
void sendDataToServer(float currentGasLevel, int digitalValue) {
    if (WiFi.status() != WL_CONNECTED || serverUrl.length() == 0) return;

    HTTPClient http;
    if (http.begin(serverUrl)) {
        http.addHeader("Content-Type", "application/json");
        String json = "{\"userId\":\"" + userId + "\"," +
                      "\"gasLevel\":" + String(currentGasLevel, 2) + "," +
                      "\"digitalValue\":" + String(digitalValue) + "}";

        int httpResponseCode = http.POST(json);
        if (httpResponseCode == 200) {
            if (digitalValue == 1) Serial.println("[ALARM] Alert sent to server successfully.");
        } else {
            Serial.println("[ERROR] Failed to send data. HTTP Code: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("[ERROR] Could not connect to server to send data.");
    }
}

/**
 * @brief Fetches the latest gas level for the user from the database.
 */
void fetchUserGasLevel() {
    if (WiFi.status() != WL_CONNECTED || getUserUrl.length() == 0) return;

    HTTPClient http;
    String fullUserUrl = getUserUrl + userId;

    if (http.begin(fullUserUrl)) {
        Serial.println("[DATABASE] Fetching latest gas level from server...");
        http.setTimeout(5000);
        int httpResponseCode = http.GET();

        if (httpResponseCode == 200) {
            String response = http.getString();
            int gasLevelIndex = response.indexOf("\"gasLevel\":");
            if (gasLevelIndex != -1) {
                int startPos = gasLevelIndex + 11;
                int endPos = response.indexOf(",", startPos);
                if (endPos == -1) endPos = response.indexOf("}", startPos);

                float dbGasLevel = response.substring(startPos, endPos).toFloat();

                userGasLevel = dbGasLevel;
                if (!dbFetched) {
                    lastSavedGasLevel = dbGasLevel;
                    dbFetched = true;
                    Serial.println("[DATABASE] Fetch successful. Initial Gas Level: " + String(userGasLevel, 1) + "%");
                } else {
                    Serial.println("[DATABASE] Sync successful. Gas Level is now: " + String(userGasLevel, 1) + "%");
                }
            }
        } else {
            Serial.println("[ERROR] Failed to fetch user data. HTTP Code: " + String(httpResponseCode));
        }
        http.end();
    } else {
        Serial.println("[ERROR] Could not connect to user API.");
    }
}

/**
 * @brief Saves the consumed gas level to the database if it has changed enough.
 * @param newGasLevel The new gas level to save.
 */
void updateGasConsumptionInDB(float newGasLevel) {
    if (WiFi.status() != WL_CONNECTED || consumptionUrl.length() == 0) return;

    if (abs(lastSavedGasLevel - newGasLevel) >= gasUpdateThreshold) {
        HTTPClient http;
        if (http.begin(consumptionUrl)) {
            http.addHeader("Content-Type", "application/json");
            String json = "{\"userId\":\"" + userId + "\",\"gasLevel\":" + String(newGasLevel, 2) + "}";

            int httpResponseCode = http.POST(json);
            if (httpResponseCode == 200) {
                Serial.println("[DATABASE] Consumption update successful. New Level: " + String(newGasLevel, 1) + "%");
                lastSavedGasLevel = newGasLevel;
            } else {
                Serial.println("[ERROR] Failed to save consumption data. HTTP Code: " + String(httpResponseCode));
            }
            http.end();
        } else {
            Serial.println("[ERROR] Could not connect to consumption API.");
        }
    }
}

// =================================================================
// --- CORE LOGIC ---
// =================================================================

/**
 * @brief Runs the gas consumption and leak simulation logic.
 */
void runGasSimulation() {
    // 1. Check if the simulated leak condition should be activated
    if (!simulatedLeakActive && userGasLevel <= leakTriggerLevel) {
        simulatedLeakActive = true;
        Serial.println("\n[!!!] SIMULATED LEAK TRIGGERED [!!!]");
        Serial.println("[INFO] Gas consumption rate increased due to leak.\n");
    }

    // 2. Determine current consumption rate based on leak status
    float currentConsumptionRate = simulatedLeakActive ? gasLeakConsumptionRate : gasConsumptionRate;

    // 3. Apply consumption
    userGasLevel -= currentConsumptionRate;
    if (userGasLevel < 0) userGasLevel = 0;

    // 4. Save the new level to the DB if the change is significant
    updateGasConsumptionInDB(userGasLevel);
}

/**
 * @brief Updates alarms and hardware (LED, Buzzer) based on current status.
 */
void updateAlarmsAndHardware() {
    int reportedDigitalValue = simulatedLeakActive ? 1 : 0; // If leak is active, report 1 (leak)
    bool isLowGas = (userGasLevel <= lowGasThreshold);
    bool isLeaking = (reportedDigitalValue == 1);
    bool criticalStatus = isLowGas || isLeaking;

    String statusText = "Normal";
    if (isLeaking && isLowGas) {
        statusText = "CRITICAL: Gas Leak and Low Tank!";
    } else if (isLeaking) {
        statusText = "ALARM: Gas Leak Detected!";
    } else if (isLowGas) {
        statusText = "WARNING: Low Gas";
    }

    if (criticalStatus) {
        digitalWrite(ledPin, HIGH);
        digitalWrite(buzzerPin, HIGH);
        sendDataToServer(userGasLevel, reportedDigitalValue);
    } else {
        digitalWrite(ledPin, LOW);
        digitalWrite(buzzerPin, LOW);
    }
    
    // Print status log
    Serial.println("---");
    Serial.println("[STATUS] Tank Level: " + String(userGasLevel, 1) + "% | Status: " + statusText);
}


// =================================================================
// --- SETUP & LOOP ---
// =================================================================

void setup() {
    Serial.begin(115200);
    delay(1000); // Wait for Serial to initialize

    pinMode(ledPin, OUTPUT);
    pinMode(buzzerPin, OUTPUT);
    digitalWrite(ledPin, LOW);
    digitalWrite(buzzerPin, LOW);

    Serial.print("Connecting to WiFi...");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n--- WiFi Connected ---");
    Serial.println("Local IP: " + WiFi.localIP().toString());

    initializeServerConnection();

    Serial.println("ESP32 Live Gas Monitor Initialized");
    Serial.println("[INFO] Target User ID: " + userId);

    randomSeed(analogRead(0));
    leakTriggerLevel = random(50, 100);
    Serial.println("[INFO] Leak simulation will trigger when gas level drops below: " + String(leakTriggerLevel, 1) + "%");
    Serial.println("------------------------------------");
}

void loop() {
    // If server connection was lost, try to re-establish it
    if (serverIP.length() == 0) {
        Serial.println("[RECONNECT] Server connection lost. Retrying in 5 seconds...");
        delay(5000); // Wait before retrying
        initializeServerConnection();
        return;
    }

    // Fetch/sync with DB periodically or for the first time
    if (!dbFetched || (millis() - lastDBFetch > dbFetchInterval)) {
        fetchUserGasLevel();
        lastDBFetch = millis();
    }

    // Only run simulation after the initial data has been fetched
    if (dbFetched) {
        runGasSimulation();
        updateAlarmsAndHardware();
    }

    delay(1000); // Main loop runs every second
}