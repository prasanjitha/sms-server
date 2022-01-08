const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyparser.json());
const PORT = 3000;

const Storage = multer.diskStorage({
  destination: "./src/image/",
  filename: (req, file, cd) => {
    return cd(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: Storage });

//connect database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "studentdb",
  port: 3306,
});
//check database connection

db.connect((err) => {
  if (err) {
    console.log(err, "dberr");
  }
  console.log("database connected..!");
});

//get all data

app.get("/student", (req, res) => {
  let qr = `select * from student`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err, "erors");
    }
    if (result.length > 0) {
      res.send({
        message: "all user data",
        data: result,
      });
    } else {
      res.send({
        message: "empty data !",
      });
    }
  });
});

//get single data

app.get("/student/:id", (req, res) => {
  let gID = req.params.id;
  let qr = `select * from student where id= ${gID}`;
  db.query(qr, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result.length > 0) {
      res.send({
        message: "get single data",
        data: result,
      });
    } else {
      res.send({
        message: "User can not found !",
      });
    }
  });
});

//create user
app.post("/student", upload.single("image"), (req, res, next) => {
  console.log(req.body, "Create student");
  try {
    var id = Math.floor(Math.random() * 90000000) + 100000000;
    var data = {
      id: id,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      school: req.body.school,
      family_name: req.body.family_name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    let results = db.query(
      `insert into student set ?`,
      [data],
      function (err, roes) {
        if (err) {
          res.send({
            message: "An Error Occured",
          });
        } else {
          res.send({
            message: "Create student successfully: " + id,
          });
        }
      }
    );
  } catch (error) {
    res.send({
      message: "An Error Occurred !",
    });
  }
});

//update single student
app.put("/student/:id", upload.single("image"), (req, res, next) => {
  console.log(req.body, "update data");
  try {
    var id = req.params.id;
    const data = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      school: req.body.school,
      family_name: req.body.family_name,
      email: req.body.email,
      phone: req.body.phone,
      image: req.file.filename,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    };
    let results = db.query(
      `update student set? where id=?`,
      [data, id],
      function (err, rows) {
        if (err) throw err;
        else {
          res.send({
            message: "successfully updated !",
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.send({
      message: "An error occured! ",
    });
  }
});

//delete single data
app.delete("/student/:id", (req, res) => {
  try {
    let qID = req.params.id;
    let qr = `delete from student where id='${qID}'`;
    db.query(qr, (err, result) => {
      if (err) {
        console.log(err);
      }
      res.send({
        message: "data deleted !",
      });
    });
  } catch (error) {
    console.log(error);
    res.send({
      message: "An error occured! ",
    });
  }
});

app.listen(PORT, function (err) {
  if (err) {
    console.log("server faild to start !");
  }
  console.log(`Server running on PORT ${PORT}`);
});

