var express = require("express")
var bodyParser = require("body-parser");
var fs = require('fs')
var app = express()
var expenses = require('./expenses.json')
var JSONStream = require("JSONStream")

var password = "rotterdam"
var kevinLijst = expenses[0]
var mattieLijst = expenses[1]
app.use(express.static('client'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.get('/api/lijsten', function (req, res) {
    console.log("GET lijsten")
    res.status(200).json(expenses);
});

app.post("/api/kevin", function (req, res) {
    console.log("POST kevin")
    if (req.body.pass !== password) {
        console.log("wrong pass:" + req.body.pass)
        res.end("0")
        return
    }
    kevinLijst.push({
        "kevin": req.body.kevin,
        "mattie": req.body.mattie,
        "comment": req.body.comment
    })
    res.end("1");
    write()
})
app.post("/api/mattie", function (req, res) {
    console.log("POST mattie")
    if (req.body.pass !== password) {
        console.log("wrong pass:" + req.body.pass)
        res.end("0")
        return
    }

    mattieLijst.push({
        "kevin": req.body.kevin,
        "mattie": req.body.mattie,
        "comment": req.body.comment
    })
    res.end("1");
    write()
})
app.get('/api/result', function (req, res) {
    console.log("GET result")
    var kevinBetaald = 0
    var kevinGespendeerd = 0
    var mattieBetaald = 0
    var mattieGespendeerd = 0

    for (var i = 0; i < kevinLijst.length; i++) {
        kevinBetaald += kevinLijst[i].kevin + kevinLijst[i].mattie
        kevinGespendeerd += kevinLijst[i].kevin
        mattieGespendeerd += kevinLijst[i].mattie
    }
    for (var i = 0; i < mattieLijst.length; i++) {
        mattieBetaald += mattieLijst[i].kevin + mattieLijst[i].mattie
        mattieGespendeerd += mattieLijst[i].mattie
        kevinGespendeerd += mattieLijst[i].kevin
    }

    var kevinverschil = kevinGespendeerd - kevinBetaald
    var mattieverschil = mattieGespendeerd - mattieBetaald

    var verschil = {
        "kevin": {
            "verschil": Math.round(kevinverschil * 100) / 100,
            "gespendeerd": Math.round(kevinGespendeerd * 100) / 100,
            "betaald": Math.round(kevinBetaald * 100) / 100
        },
        "mattie": {
            "verschil": Math.round(mattieverschil * 100) / 100,
            "gespendeerd": Math.round(mattieGespendeerd * 100) / 100,
            "betaald": Math.round(mattieBetaald * 100) / 100
        }
    }
    res.status(200).json(verschil);
});
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function write() {
    var array = expenses
    var file = "/expenses.json"
    try {
        var transformStream = JSONStream.stringify()
        var outputStream = fs.createWriteStream(__dirname + file)
        transformStream.pipe(outputStream)
        array.forEach(transformStream.write)
        transformStream.end()
        outputStream.on(
            "finish",
            function handleFinish() {
                //finish
            }
        )
        outputStream.on(
            "finish",
            function handleFinish() {
                var transformStream = JSONStream.parse("*")
                var inputStream = fs.createReadStream(__dirname + file)
                inputStream
                    .pipe(transformStream)
                    .on(
                        "data",
                        function handleRecord(data) {
                            //writing
                        }
                    )
                    .on(
                        "end",
                        function handleEnd() {
                            console.log("JSONStream parsing complete!")
                        }
                    )
            }
        )
    } catch (err) {
        console.log(err)
    }
}
app.listen(3000);
