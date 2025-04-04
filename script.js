const API_BASE_URL = "http://127.0.0.1:8000"; // Your FastAPI base URL

// Upload training data
function uploadFile() {
    let fileInput = document.getElementById("uploadFile");
    let files = fileInput.files;
    
    if (files.length === 0) {
        alert("Please select a file to upload.");
        return;
    }

    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
    }

    fetch(`${API_BASE_URL}/upload-zip/`, {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById("message").innerText = data.message || "File uploaded successfully.";
            document.getElementById("uploadFile").value = "";
        }
    })
    .catch(error => {
        console.error("Error uploading file:", error);
        document.getElementById("message").innerText = "File upload failed. Please try again.";
    });
}

// Retrain model
function retrainModel() {
    const retrainButton = document.getElementById("retrainButton");
    const messageElement = document.getElementById("message");
    const performanceMetricsElement = document.getElementById("performance-metrics");

    // loading
    retrainButton.disabled = true;
    retrainButton.innerText = "Retraining... Please wait...";
    
    // Fetch retraining endpoint
    fetch(`${API_BASE_URL}/retrain/`, {
        method: "POST",
    })
    .then(response => response.json())
    .then(data => {
        // Update the button text to success and enable it
        retrainButton.disabled = false;
        retrainButton.innerText = "Retrain Model";

        // Show retraining result
        messageElement.innerText = data.message || "Model retrained successfully.";

        // Display the model's performance metrics after retraining
        if (data.metrics) {
            document.getElementById("accuracy").innerText = `Final Accuracy: ${(data.metrics.final_accuracy * 100).toFixed(2)}%`;
            document.getElementById("val_accuracy").innerText = `Final Validation Accuracy: ${(data.metrics.final_val_accuracy * 100).toFixed(2)}%`;
            document.getElementById("loss").innerText = `Final Loss: ${data.metrics.final_loss.toFixed(4)}`;
            document.getElementById("val_loss").innerText = `Final Validation Loss: ${data.metrics.final_val_loss.toFixed(4)}`;
            performanceMetricsElement.style.display = "block";
        }
    })
    .catch(error => {
        console.error("Error retraining model:", error);
        messageElement.innerText = "Retraining failed. Please try again.";
        retrainButton.disabled = false;
        retrainButton.innerText = "Retrain Model";
    });
}


// Predict
function predictDisease() {
    let fileInput = document.getElementById("predictFile");
    let file = fileInput.files[0];

    if (!file) {
        alert("Please select an image for prediction.");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    fetch(`${API_BASE_URL}/predict/`, {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Prediction failed. Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('API Response:', data);

        if (data.prediction && data.confidence !== undefined) {
            const predictionText = `Prediction: ${data.prediction}<br>Confidence: ${(data.confidence * 100).toFixed(2)}%`;
            document.getElementById("prediction-result").innerHTML = predictionText;
        } else {
            document.getElementById("prediction-result").innerText = "Prediction result is missing or invalid.";
        }
    })
    .catch(error => {
        console.error("Error predicting disease:", error);
        document.getElementById("prediction-result").innerText = `Prediction failed. Please try again. Error: ${error.message}`;
    });
}

