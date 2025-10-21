/*
 * ESP32 Live Gas Monitor (Fixed Leak Logic)
 *
 * Description:
 * 1. Connects to Node.js backend via Wokwi host.
 * 2. Fetches initial gas level for user.
 * 3. Simulates gas consumption and saves updates to the DB.
 * 4. Simulated leak triggers when gas ≤ 50% and stops when gas ≤ 5%.
 * 5. Sends alarms to server when leak or low gas detected.
 * 6. LED + buzzer indicate active alarms.
 */

#include <WiFi.h>
#include <HTTPClient.h>

// =================================================================
// --- USER CONFIGURATION ---
// =================================================================
String userId = "68f7c07686162ccd34e0391b";

// --- WiFi Configuration ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// --- Server Configuration ---
const char* wokwiHost = "host.wokwi.internal";
String fallbackServerIP = "192.168.103.252";
const int serverPort = 5000;

// =================================================================
// --- GLOBAL VARIABLES & CONSTANTS ---
// =================================================================
String serverIP = "";
String serverUrl = "";
String consumptionUrl = "";
String getUserUrl = "";

const int gasSensorAnalogPin = 32;
const int gasSensorDigitalPin = 33;
const int ledPin = 21;
const int buzzerPin = 22;

float userGasLevel = 0.0;
float lastSavedGasLevel = 0.0;
const int lowGasThreshold = 20;

const float gasConsumptionRate = 0.5;     // Normal: 0.5%/s
const float gasLeakConsumptionRate = 2.5; // Leak: 2.5%/s

bool simulatedLeakActive = false;

unsigned long lastDBFetch = 0;
const unsigned long dbFetchInterval = 10000;
const float gasUpdateThreshold = 2.0;
bool dbFetched = false;

// =================================================================
// --- FORWARD DECLARATIONS ---
// =================================================================
void initializeServerUrls();
void fetchUserGasLevel();

// =================================================================
// --- SERVER & NETWORK FUNCTIONS ---
// =================================================================

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

void initializeServerConnection() {
    Serial.println("[SERVER] Trying to connect via Wokwi hostname: " + String(wokwiHost));
    serverIP = wokwiHost;
    initializeServerUrls();

    HTTPClient http;
    if (http.begin(getUserUrl + userId)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode > 0) {
            Serial.println("[SUCCESS] Connected to server via Wokwi hostname. Code: " + String(httpCode));
            http.end();
            return;
        }
        http.end();
    }

    Serial.println("[FALLBACK] Wokwi hostname failed. Trying fallback IP: " + fallbackServerIP);
    serverIP = fallbackServerIP;
    initializeServerUrls();

    if (http.begin(getUserUrl + userId)) {
        http.setTimeout(4000);
        int httpCode = http.GET();
        if (httpCode > 0) {
            Serial.println("[SUCCESS] Connected via fallback IP. Code: " + String(httpCode));
        } else {
            Serial.println("[ERROR] Fallback IP also failed. Check your Node.js server.");
            serverIP = "";
        }
        http.end();
    }
}

// =================================================================
// --- DATABASE FUNCTIONS ---
// =================================================================

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
    }
}

void fetchUserGasLevel() {
    if (WiFi.status() != WL_CONNECTED || getUserUrl.length() == 0) return;
    HTTPClient http;
    String fullUserUrl = getUserUrl + userId;
    if (http.begin(fullUserUrl)) {
        Serial.println("[DATABASE] Fetching latest gas level...");
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
                    Serial.println("[DATABASE] Initial Gas Level: " + String(userGasLevel, 1) + "%");
                } else {
                    Serial.println("[DATABASE] Synced. Gas Level: " + String(userGasLevel, 1) + "%");
                }
            }
        } else {
            Serial.println("[ERROR] Failed to fetch user data. HTTP Code: " + String(httpResponseCode));
        }
        http.end();
    }
}

void updateGasConsumptionInDB(float newGasLevel) {
    if (WiFi.status() != WL_CONNECTED || consumptionUrl.length() == 0) return;
    if (abs(lastSavedGasLevel - newGasLevel) >= gasUpdateThreshold) {
        HTTPClient http;
        if (http.begin(consumptionUrl)) {
            http.addHeader("Content-Type", "application/json");
            String json = "{\"userId\":\"" + userId + "\",\"gasLevel\":" + String(newGasLevel, 2) + "}";
            int httpResponseCode = http.POST(json);
            if (httpResponseCode == 200) {
                Serial.println("[DATABASE] Gas Level Updated: " + String(newGasLevel, 1) + "%");
                lastSavedGasLevel = newGasLevel;
            } else {
                Serial.println("[ERROR] Failed to update. HTTP Code: " + String(httpResponseCode));
            }
            http.end();
        }
    }
}

// =================================================================
// --- CORE LOGIC (FIXED LEAK SYSTEM) ---
// =================================================================

void runGasSimulation() {
    // 1. Start simulated leak when gas level is 50% or below
    if (!simulatedLeakActive && userGasLevel <= 50) {
        simulatedLeakActive = true;
        Serial.println("\n[!!!] SIMULATED LEAK TRIGGERED [!!!]");
        Serial.println("[INFO] Gas consumption rate increased due to leak.\n");
    }

    // 2. Stop the simulated leak when gas level is 5% or below
    if (simulatedLeakActive && userGasLevel <= 5) {
        simulatedLeakActive = false;
        Serial.println("\n[INFO] Leak condition cleared — Gas level critically low (<5%).");
        Serial.println("[INFO] Returning to normal consumption rate.\n");
    }

    // 3. Determine current consumption rate
    float currentConsumptionRate = simulatedLeakActive ? gasLeakConsumptionRate : gasConsumptionRate;

    // 4. Apply consumption
    userGasLevel -= currentConsumptionRate;
    if (userGasLevel < 0) userGasLevel = 0;

    // 5. Save new level to DB
    updateGasConsumptionInDB(userGasLevel);
}

void updateAlarmsAndHardware() {
    int reportedDigitalValue = simulatedLeakActive ? 1 : 0;
    bool isLowGas = (userGasLevel <= lowGasThreshold);
    bool isLeaking = (reportedDigitalValue == 1);
    bool criticalStatus = isLowGas || isLeaking;

    String statusText = "Normal";
    if (isLeaking && isLowGas) statusText = "CRITICAL: Gas Leak and Low Tank!";
    else if (isLeaking) statusText = "ALARM: Gas Leak Detected!";
    else if (isLowGas) statusText = "WARNING: Low Gas";

    if (criticalStatus) {
        digitalWrite(ledPin, HIGH);
        digitalWrite(buzzerPin, HIGH);
        sendDataToServer(userGasLevel, reportedDigitalValue);
    } else {
        digitalWrite(ledPin, LOW);
        digitalWrite(buzzerPin, LOW);
    }

    Serial.println("---");
    Serial.println("[STATUS] Tank Level: " + String(userGasLevel, 1) + "% | Status: " + statusText);
}

// =================================================================
// --- SETUP & LOOP ---
// =================================================================

void setup() {
    Serial.begin(115200);
    delay(1000);

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
    Serial.println("[INFO] Leak simulation starts when gas ≤ 50% and stops when gas ≤ 5%.");
    Serial.println("------------------------------------");
}

void loop() {
    if (serverIP.length() == 0) {
        Serial.println("[RECONNECT] Server lost. Retrying in 5s...");
        delay(5000);
        initializeServerConnection();
        return;
    }

    if (!dbFetched || (millis() - lastDBFetch > dbFetchInterval)) {
        fetchUserGasLevel();
        lastDBFetch = millis();
    }

    if (dbFetched) {
        runGasSimulation();
        updateAlarmsAndHardware();
    }

    delay(1000);
}
