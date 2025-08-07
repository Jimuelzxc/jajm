// Photoshop Automation Script - v5
// Updated to use real-world sizes in inches.

// --- Configuration ---
var dataFilePath = app.activeDocument.path + "/players.txt";
var outputFolderPath = app.activeDocument.path + "/save";
var lastnameLayerName = "lastname";
var numberLayerName = "number";
var sizeLayerName = "size";

// --- Size Mappings (in Inches) ---
// Updated with the real sizes from the provided image.
var sizeMappings = {
    // Pixel values are calculated at 150 DPI (pixels = inches * 150)
    "xs":  { width: 41.1, height: 29.2 }, // 6165 x 4380 px
    "s":   { width: 46,   height: 30.2 }, // 6900 x 4530 px
    "m":   { width: 47.6, height: 31.2 }, // 7140 x 4680 px
    "l":   { width: 49.2, height: 32.2 }, // 7380 x 4830 px
    "xl":  { width: 50.6, height: 33.2 }, // 7590 x 4980 px
    "2xl": { width: 52,   height: 34.2 }, // 7800 x 5130 px
    "3xl": { width: 55.6, height: 35.2 }, // 8340 x 5280 px
    "4xl": { width: 57,   height: 36.2 }, // 8550 x 5430 px
    "5xl": { width: 58.6, height: 37.2 }  // 8790 x 5580 px
};

// --- Helper Functions ---

function readDataFromFile(filePath) {
    var file = new File(filePath);
    var data = [];
    if (!file.exists) {
        alert("Error: Data file not found at:\n" + filePath);
        return data;
    }
    try {
        file.open('r');
        var header = file.readln().split(',');
        for (var h = 0; h < header.length; h++) {
            header[h] = header[h].replace(/^\s+|\s+$/g, '');
        }
        while (!file.eof) {
            var line = file.readln();
            if (line.replace(/\s/g, '').length > 0) {
                var parts = line.split(',');
                if (parts.length >= header.length) {
                    var entry = {};
                    for (var i = 0; i < header.length; i++) {
                        entry[header[i]] = parts[i].replace(/^\s+|\s+$/g, '');
                    }
                    data.push(entry);
                }
            }
        }
    } catch (e) {
        alert("Error reading file: " + e);
    } finally {
        if (file.isOpen) {
            file.close();
        }
    }
    return data;
}

function findAllLayersByName(layerName, parent, foundLayers) {
    for (var i = 0; i < parent.artLayers.length; i++) {
        if (parent.artLayers[i].name === layerName) {
            foundLayers.push(parent.artLayers[i]);
        }
    }
    for (var j = 0; j < parent.layerSets.length; j++) {
        findAllLayersByName(layerName, parent.layerSets[j], foundLayers);
    }
}

/**
 * Resizes the active document.
 * @param {number} width - The target width in inches.
 * @param {number} height - The target height in inches.
 */
function resizeImage(width, height) {
    if (width && height) {
        var doc = app.activeDocument;
        // Parameters: width, height, resolution, resampleMethod
        doc.resizeImage(UnitValue(width, "in"), UnitValue(height, "in"), 150, ResampleMethod.BICUBIC);
    }
}

// --- Main Script ---

if (app.documents.length === 0) {
    alert("No Photoshop document is open. Please open your template file and run the script again.");
} else {
    var doc = app.activeDocument;
    var allData = readDataFromFile(dataFilePath);

    if (allData.length === 0) {
        alert("No data was found in the specified file or the file is empty.");
    } else {
        var lastnameLayers = [];
        findAllLayersByName(lastnameLayerName, doc, lastnameLayers);
        var numberLayers = [];
        findAllLayersByName(numberLayerName, doc, numberLayers);
        var sizeLayers = [];
        findAllLayersByName(sizeLayerName, doc, sizeLayers);

        if (lastnameLayers.length === 0) {
            alert("A text layer named '" + lastnameLayerName + "' was not found.");
        } else if (numberLayers.length === 0) {
            alert("A text layer named '" + numberLayerName + "' was not found.");
        } else if (sizeLayers.length === 0) {
            alert("No text layers named '" + sizeLayerName + "' were found.");
        } else {
            var outputFolder = new Folder(outputFolderPath);
            if (!outputFolder.exists) {
                outputFolder.create();
            }

            var saveOptions = new JPEGSaveOptions();
            saveOptions.quality = 12; // Set JPEG quality (0-12, 12 is max)
            
            var originalRulerUnits = app.preferences.rulerUnits;
            app.preferences.rulerUnits = Units.INCHES; // Set units to inches for resizing

            // Save the initial state of the document to revert back to after each export
            var initialState = doc.activeHistoryState;

            for (var i = 0; i < allData.length; i++) {
                var currentData = allData[i];
                
                // Update all "lastname" layers
                for (var l = 0; l < lastnameLayers.length; l++) {
                    lastnameLayers[l].textItem.contents = currentData.lastname;
                }

                // Update all "number" layers
                for (var n = 0; n < numberLayers.length; n++) {
                    numberLayers[n].textItem.contents = currentData.number;
                }

                // Update all "size" layers
                for (var s = 0; s < sizeLayers.length; s++) {
                    sizeLayers[s].textItem.contents = currentData.size.toUpperCase();
                }

                // Determine image size from the mappings
                var dimensions = sizeMappings[currentData.size.toLowerCase()];

                // Resize the image before saving
                if (dimensions) {
                    resizeImage(dimensions.width, dimensions.height);
                } else {
                    alert("Warning: Size '" + currentData.size + "' not found in sizeMappings for " + currentData.lastname + ". Image will not be resized.");
                }

                // Save the JPEG
                var outputFileName = currentData.lastname + "_" + currentData.number + "_" + currentData.size + ".jpg";
                var outputFile = new File(outputFolder.fsName + "/" + outputFileName);
                doc.saveAs(outputFile, saveOptions, true, Extension.LOWERCASE);

                // Revert to the original state for the next iteration
                doc.activeHistoryState = initialState;
            }
            
            app.preferences.rulerUnits = originalRulerUnits;

            alert("Automation complete!\n" + allData.length + " JPEG files have been saved to:\n" + outputFolder.fsName);
        }
    }
}
