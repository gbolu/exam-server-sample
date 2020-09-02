const express = require("express");
const mysql = require("./db/dbconfig");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

const studentsService = "http://localhost:2000";

app.get("/questions", async (req, res) => {
  const examID = req.query.examID;
  let examQuestions;
  try {
    examQuestions = await mysql("exams_server.exams")
      .join(
        "exams_server.questions",
        "exams_server.exams.id",
        "=",
        "exams_server.questions.exam_id"
      )
      .where({
        "exams.id": examID,
      })
      .select("EXAM_NAME", "EXAM_ID", "QUESTION_ID", "QUESTION", "OPTIONS")
      .orderBy("question_id", "asc");
    examQuestions = examQuestions.map((examQuestion) => {
      examQuestion.OPTIONS = JSON.parse(examQuestion.OPTIONS);
      return examQuestion;
    });
    res.send({ examQuestions: examQuestions });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: error,
    });
  }
});

app.get("/exams", async (req, res) => {
  let result;
  try {
    result = await mysql("exams_server.exams").where({
      "exams.id": req.query.examID,
    });
    res.status(200).send({ ...result[0] });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error,
    });
  }
});

app.post("/postSubmission", async (req, res) => {
  let submissions = req.body.submission;
  let attempt = [];
  for (let index = 0; index < submissions.length; index++) {
    try {
      let result = await mysql("exams_server.questions")
        .where({
          QUESTION_ID: submissions[index].question_id,
          EXAM_ID: req.body.examID,
        })
        .select("OPTIONS");
      const results = JSON.parse(result[0].OPTIONS);
      const correctOption = results.options.find((option) => {
        return option.valid === true;
      });

      if (
        submissions[index].option_choice.trim() ===
        correctOption.optionsText.trim()
      ) {
        submissions[index].question_pass = true;
      }
      attempt.push(submissions[index]);
    } catch (error) {
      console.log(error);
      res.status(500).send({
        message: error.message,
      });
    }
  }

  let score = 0;
  for (question of attempt) {
    if (question.question_pass === true) {
      score += 10;
    }
  }

  let userSubmission = {
    USER_REG_ID: req.body.userID,
    EXAM_ID: req.body.examID,
    SUBMISSION: JSON.stringify({
      attempt: attempt,
    }),
    SCORE: score,
  };

  try {
    let tempSubmissionResult = await mysql("exams_server.submissions").where({
      USER_REG_ID: req.body.userID,
    });
    if (tempSubmissionResult.length === 0) {
      try {
        let id = await mysql("exams_server.submissions").insert(userSubmission);
        let results = await mysql("exams_server.submissions").where({
          ID: id,
        });
        userSubmission = results[0];
      } catch (error) {
        console.log(error);
        res.status(500).send({
          message: error,
        });
      }
    } else {
      tempSubmissionResult = await mysql("exams_server.submissions")
        .where({
          USER_REG_ID: req.body.userID,
        })
        .update(userSubmission);
      let results = await mysql("exams_server.submissions").where({
        USER_REG_ID: req.body.userID,
      });
      userSubmission = { ...results[0] };
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error,
    });
  }

  userSubmission.SUBMISSION = JSON.parse(userSubmission.SUBMISSION);

  res.status(200).send({
    userSubmission: userSubmission,
  });
});

app.listen(3000, () => console.log("Exams service listening on port 3000"));
