document.addEventListener("DOMContentLoaded", () => {
    const calculationMethodInput = document.querySelector("#calculationMethod");
    const meterReadingInputs = document.querySelector("#meterReadingInputs");
    const directValueInputs = document.querySelector("#directValueInputs");
    const mcbAmphereInput = document.querySelector("#mcb-Amphere");
    const mcbAmphereInput2 = document.querySelector("#mcb-AmphereDirect");
    const meterReadingInput = document.querySelector("#meterReading");
    const previousReadingInput = document.querySelector("#previousReading");
    const directValueInput = document.querySelector("#directValue");
    const meterReadingError = document.querySelector("#meterReadingError");
    const previousReadingError = document.querySelector("#previousReadingError");
    const directValueError = document.querySelector("#directValueError");
    const totalUnit = document.querySelector("#totalUnit");
    const totalAmount = document.querySelector("#totalAmount");
    
    let calculatingInterval;
    let isCalculating = false;

    calculationMethodInput.addEventListener("change", function() {
        const selectedMethod = this.value;
        if (selectedMethod === "meterReading") {
            meterReadingInputs.style.display = "block";
            directValueInputs.style.display = "none";
        } else if (selectedMethod === "directValue") {
            meterReadingInputs.style.display = "none";
            directValueInputs.style.display = "block";
        }
    });

    function showCalculatingEffect() {
        if (isCalculating) return;
        isCalculating = true;

        let dots = 0;
        totalUnit.textContent = "Calculating";

        calculatingInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            let dotString = ".".repeat(dots);
            totalUnit.textContent = `Calculating${dotString}`;
        }, 50);
    }

    function stopCalculatingEffect() {
        clearInterval(calculatingInterval);
        isCalculating = false; // Reset flag
    }

    function calculateAndDisplayBill() {
        // Reset output divs before starting a new calculation
        totalUnit.textContent = "";
        totalAmount.textContent = "";

        const selectedMethod = calculationMethodInput.value;
        let mcbAmphere;
            if (selectedMethod === "meterReading") {
                mcbAmphere = mcbAmphereInput.value;
            } else if (selectedMethod === "directValue") {
                mcbAmphere = mcbAmphereInput2.value;
            }

        let consumption;

        // Reset error messages
        meterReadingError.textContent = "";
        previousReadingError.textContent = "";
        directValueError.textContent = "";

        if (selectedMethod === "meterReading") {
            consumption = calculateMeterReading();
        } else if (selectedMethod === "directValue") {
            consumption = calculateDirectValue();

            if(consumption === null) {
                totalUnit.textContent = "Waiting for input...";
                totalAmount.textContent = "";
                return;
            }
        }

        if (consumption === null) return; // If there's an error in calculation, exit early

        // Show calculating effect
        showCalculatingEffect();

        setTimeout(() => {
            processCalculation(mcbAmphere, consumption);
        }, 300);
    }

    function calculateMeterReading() {
        const meterReading = meterReadingInput.value.trim();
        const previousReading = previousReadingInput.value.trim();

        // Validate inputs
        if (meterReading === "") {
            meterReadingError.textContent = "Please enter your meter reading";
            totalUnit.textContent = "Waiting for input...";
            return null;
        } else if (/[^0-9]/.test(meterReading)) {
            meterReadingError.textContent = "Enter only numbers for meter reading";
            totalUnit.textContent = "Waiting for input...";
            return null;
        }

        // Validate previous reading
        if (previousReading === "") {
            previousReadingError.textContent = "Please enter your previous reading";
            totalUnit.textContent = "Waiting for input...";
            return null;
        } else if (/[^0-9]/.test(previousReading)) {
            previousReadingError.textContent = "Enter only numbers for previous reading";
            totalUnit.textContent = "Waiting for input...";
            return null;
        }

        const consumption = parseInt(meterReading) - parseInt(previousReading);
        if (isNaN(consumption) || consumption < 0) {
            previousReadingError.textContent = "Previous reading must be less than meter reading";
            return null;
        }

        return consumption;
    }

    function calculateDirectValue() {
        const directValue = directValueInput.value.trim();
        if (directValue === "") {
            directValueError.textContent = "Please enter the value";
            totalUnit.textContent = "";
            totalAmount.textContent = "";
            return null;
        } else if (/[^0-9]/.test(directValue)) {
            directValueError.textContent = "Enter only numbers for direct value";
            totalUnit.textContent = "";
            totalAmount.textContent = "";
            return null;
        }
        return parseInt(directValue);
    }

    function processCalculation(mcbAmphere, consumption) {
        // Calculate total amount
        const totalBill = calculateTotalBill(mcbAmphere, consumption);

        // Display total amount
        totalUnit.textContent = `Total Unit consumed: ${consumption.toLocaleString("en-IN")} KWh`;
        totalAmount.textContent = `Total Amount in NPR is: Rs ${totalBill.toLocaleString("en-IN")}`;

        // Stop calculating effect after displaying the result
        stopCalculatingEffect();
        console.log("Calculation completed successfully");
    }

    // Attach event listener for automatic calculation
    meterReadingInput.addEventListener("input", () => {
        calculateAndDisplayBill();
    });
    previousReadingInput.addEventListener("input", () => {
        calculateAndDisplayBill();
    });
    directValueInput.addEventListener("input", () => {
        setTimeout(() => calculateAndDisplayBill(), 300);
    });

    // Allow submit button to calculate
    const calculateButton = document.querySelector("#calculateButton");
    calculateButton.addEventListener("click", (event) => {
        event.preventDefault();
        calculateAndDisplayBill();
    });

    // Add event listener for MCB Ampere change
    mcbAmphereInput.addEventListener("change", () => {
        // Trigger calculation when MCB Ampere is changed
        calculateAndDisplayBill();
    });

    mcbAmphereInput2.addEventListener("change", () => {
        // Trigger calculation when MCB Ampere is changed
        calculateAndDisplayBill();
    });

    // Footer
    document.getElementById("year").textContent = new Date().getFullYear();
});

function calculateTotalBill(mcbAmphere, consumption) {
    const serviceCharge = getServiceCharge(mcbAmphere, consumption);
    const energyCharge = getEnergyCharge(mcbAmphere, consumption);

    return serviceCharge + (energyCharge * consumption);
}

function getServiceCharge(mcbAmphere, consumption) {
    const serviceChargeRates = {
        "5": [30, 50, 75, 100, 125, 150, 175],
        "15": [50, 75, 100, 125, 150, 175, 200],
        "30": [75, 100, 125, 150, 175, 200, 225],
        "60": [125, 150, 175, 200, 225, 250, 275]
    };

    return determineCharge(serviceChargeRates[mcbAmphere], consumption);
}

function getEnergyCharge(mcbAmphere, consumption) {
    const energyChargeRates = {
        "5": [3, 7, 8.5, 10, 11, 12, 13],
        "15": [4, 7, 8.5, 10, 11, 12, 13],
        "30": [5, 7, 8.5, 10, 11, 12, 13],
        "60": [6, 7, 8.5, 10, 11, 12, 13]
    };

    return determineCharge(energyChargeRates[mcbAmphere], consumption);
}

function determineCharge(rateArray, consumption) {
    if (consumption <= 20) return rateArray[0];
    if (consumption <= 30) return rateArray[1];
    if (consumption <= 50) return rateArray[2];
    if (consumption <= 150) return rateArray[3];
    if (consumption <= 250) return rateArray[4];
    if (consumption <= 400) return rateArray[5];
    return rateArray[6]; // Above 400
}