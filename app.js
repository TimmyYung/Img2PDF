// Declared all the imports
const express = require("express");
const app = express(); // Initializes experess
const fs = require("fs"); // Read and create files
const multer = require("multer"); // Upload files to server
const { TesseractWorker } = require('tesseract.js'); // Read images
const worker = new TesseractWorker(); // Analyzes the image

// Declared storage
const storage = multer.diskStorage({ // Save images uploaded
    destination: (req, file, cb) => { // Request, Response, Callback
        cb(null, "./uploads"); // Work when image is uploaded
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Saves the file to the original name
    },
});
const upload = multer({storage: storage}).single("avatar"); // Uses storage constant and calls the file avatar

app.set("view engine", "ejs"); // Uses ejs to display backend code
app.use(express.static("public"));
// ROUTES

app.get("/", (req, res) => {
    res.render("index"); // Renders the index page
});


app.post("/upload", (req, res) => {
    upload(req, res, err => {
        // Reads the file uploaded to analyze
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log("This is your error", err); // Shows the error if one happens

            worker
                .recognize(data, "eng", {tessjs_create_pdf: "1"}) // Creates only one PDF
                .progress(progress => {
                    console.log(progress); 
                })
                .then(result => {
                    res.redirect("/download")
                })
                .finally(() => worker.terminate()); // Stops working
        });
    });
});

app.get("/download", (req, res) => {
    const file =`${__dirname}/tesseract.js-ocr-result.pdf`
    res.download(file);
})

// Start the server
const PORT = 5000 || process.env.PORT; // Run on local or on the internet
app.listen(PORT, () => console.log(`Hey I'm running on PORT ${PORT}`));