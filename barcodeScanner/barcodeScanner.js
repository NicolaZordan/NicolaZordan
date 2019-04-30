
// NZ barcodeScanner with Quagga 4/16/2019


//    <script src="jquery-1.9.0.min.js" src="vendor/jquery-1.9.0.min.js" type="text/javascript"></script>
//    <script 0src="//webrtc.github.io/adapter/adapter-latest.js" type="text/javascript"></script>
//    <script src="quagga.js" 0src="../dist/quagga.js" type="text/javascript"></script>
    
// Setup
// https://serratus.github.io/quaggaJS/#configobject

var barcodeScanner = {

  config: {
    numOfWorkers: 4,
    //numOfWorkers: 0, // nz test
        //locate: true,
    //locate: true, // default false
    locate: false,
    inputStream: {
        name: "Live",
        //type: "LiveStream",  //default
        constraints: {
            width: 640,
            height: 480,
            facingMode: "environment", // outside, back of phone, default
            //deviceId: "7832475934759384534" // only of required, use default
            deviceId: null,   // use default
                // set on load by barcodeQuaggaSetCamera
                // select from  Quagga.CameraAccess.enumerateVideoDevices() .then();
            //torch: true,  // not working
        },
        //area: { // defines rectangle of the detection/localization area
        //    top: "0%",    // top offset
        //    right: "0%",  // right offset
        //    left: "0%",   // left offset
        //    bottom: "0%"  // bottom offset
        //},
        singleChannel: false,// true: only the red color-channel is read
        //target: "#interactive.viewport", // default "#interactive.viewport"
            // div and class for target: <div id="interactive" class="viewport"></div>
    },
    frequency: 10,
    decoder:{
        readers: [
            //'code_128_reader' // default
            'upc_reader'
            // available: 
            //'code_128_reader' // (default)
            //'ean_reader'
            //'ean_8_reader'
            //'code_39_reader'
            //'code_39_vin_reader'
            //'codabar_reader'
            //'upc_reader'
            //'upc_e_reader'
            //'i2of5_reader'
            //'2of5_reader'
            //'code_93_reader'
        ],
        debug: {
            drawBoundingBox: false,  // default false
            showFrequency: false,
            drawScanline: false,     // default false
            showPattern: false,
            //- from other example
            //showCanvas: true,
            //showPatches: true,
            //showFoundPatches: true,
            //showSkeleton: true,
            //showLabels: true,
            //showPatchLabels: true,
            //showRemainingPatchLabels: true,
            //boxFromPatches: {
            //    showTransformed: true,
            //    showTransformedBox: true,
            //    showBB: true
            //}

        },
        multiple: false 
    },
    locator: {
        halfSample: true,       // suggested on
        patchSize: "medium", // x-small, small, medium, large, x-large
        debug: {        // default all false
            showCanvas: false,
            showPatches: false,          // default false
            showFoundPatches: false,    //
            showSkeleton: false,        
            showLabels: false,
            showPatchLabels: false,     
            showRemainingPatchLabels: false,
            boxFromPatches: {
                showTransformed: false,
                showTransformedBox: false,  // default false
                showBB: false,
            }
        }
    },
    debug: false,        
    //torch: ?,  // Can turn flashlight on for teh camera
  },

  // Start
  start: function (field, func) {
    // setup
    if (field!=null) {
        barcodeScanner.inputField=field;
    }  
    if (func!=null) {
        barcodeScanner.scannedFunction=func;
    }  
    // config
    Quagga.init(     // config, completiongHandlerFunction
        barcodeScanner.config,
        function (err) {
            if (err) {
                console.log(err);
                alert('Error starting Barcode Reader \n'+err);
                return
            }
            // if ok start camera and barcode scan
            console.log("Barcode Reader Initialization finished. Ready to start");
            // set camera
            // set scanned code event processing
            Quagga.onDetected(barcodeScanner.scannedCodeEvent);
            // show camera visible: <div id="interactive">
            var viewport=document.getElementById("interactive");
            if (viewport!=null) viewport.style.display="inline";
            //- show boxes, if locate=true
            if (barcodeScanner.config.locate) {
                Quagga.onProcessed(barcodeScanner.showBoxesFunction);
            }
            // quagga Start
            Quagga.start();
        }
    );
  },

  // Stop
  stop: function () {
    // stop quagga
    // stop detection
    Quagga.offDetected(barcodeScanner.scannedCodeEvent);
    // stop show boxes
    if (barcodeScanner.config.locate) {
        Quagga.onProcessed(barcodeScanner.showBoxesFunction);
    }
    // stop
    Quagga.stop();
    // show camera visible
    var viewport=document.getElementById("interactive");
    if (viewport!=null) viewport.style.display="none";
  },

  // Get Scanned BarCode
  inputField: null,     // input field
  //inputFieldFunction: null, // to be overridden
    // barcodeInputField = document.form.field; // document.LANSA.NEWITEM
    // barcodeInputField = document.getElementById("inputFieldId");
  scanned: null,  // scanned barcode
  scannedFunction: function () {}, // to be overridden
  scannedCodeEvent: function (result) {
    var barcode=result.codeResult.code;
    barcodeScanner.scanned=barcode;
    // set field value
    if (barcodeScanner.inputField!=null) {
        barcodeScanner.inputField.value=barcode;
    };
    // invoke function to process
    if (barcodeScanner.scannedFunction!=null) {
        barcodeScanner.scannedFunction(barcode);
    };
    // stop
    barcodeScanner.stop();
    return barcode;
  },


  // show boxes
  showBoxesFunction: function (result) {
    var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

    if (result) {
        if (result.boxes) {
            drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
            result.boxes.filter(function (box) {
                return box !== result.box;
            }).forEach(function (box) {
                //console.log('processing boxes: '+box);
                Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
            });
        }

        if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "blue", lineWidth: 2});
        }

        if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 4});
        }
    }

  },

  
};

// customize in page
//
// barcodeScanner.inputField=document.nzInput.barcodeField;
//
// barcodeScanner.scannedFunction= function (barcode) { 
//    console.log("Scanned barcode: ["+barcode+"]");
// };


