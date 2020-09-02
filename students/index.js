const express = require("express");
const mysql = require("./db/dbconfig");

const app = express();

app.get("/students", async (req, res) => {
  const userDetails = {
    USER_REG_ID: req.query.regID,
    DISPLAY_NAME: req.query.displayName,
  };

  // check if user in db.   If not, append to db.
  mysql("exams_server.students")
    .where(userDetails)
    .then((rows) => {
      if (rows.length === 0) {
        mysql("exams_server.students")
          .insert(userDetails)
          .then((results) => {
            console.log(results);
          });
      }
      res.status(200).send({
        userDetails: userDetails,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({
        message: error,
      });
    });
});

app.listen(2000, () => console.log("Student service has started on port 2000"));
