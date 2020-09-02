const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const axios = require("axios").default;

const app = express();

const htmlOptions = {
  root: path.join(__dirname, "public"),
};

const studentsService = "http://localhost:2000";
const examService = "http://localhost:3000";

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("./public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.get("/", (req, res) => {
  res.sendFile("login.html", htmlOptions);
});

app.post("/login", async (req, res) => {
  let userDetails;
  try {
    let results = await axios.get(studentsService + `/students`, {
      params: {
        regID: req.body.regID,
        displayName: req.body.displayName,
      },
    });
    userDetails = results.data.userDetails;
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occured. Please try again.");
  }
  const examID = 1;

  let examQuestions;
  try {
    const results = await axios.get(examService + "/questions", {
      params: {
        examID: examID,
      },
    });
    const examSearchResults = await axios.get(examService + "/exams", {
      params: {
        examID: examID,
      },
    });
    examDetails = examSearchResults.data;
    examQuestions = results.data.examQuestions;
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send("Could not retrieve exam questions. Please try again.");
  }
  // console.log(userDetails);
  res.status(200).render("exam", {
    userDetails: userDetails,
    examDetails: examDetails,
    exam_questions: examQuestions,
  });
});

app.post("/exams/submit", async (req, res) => {
  console.log(req.body);
  let userDetails;
  try {
    const rtnVal = await axios.get(studentsService + "/students", {
      params: {
        regID: req.query.USER_REG_ID,
        displayName: req.query.DISPLAY_NAME,
      },
    });
    userDetails = rtnVal.data.userDetails;
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Invalid user details. Please try again.",
    });
  }

  let userSubmissions = [];
  let index = 1;
  while (true) {
    if (req.body["QUESTION_" + index]) {
      userSubmissions.push({
        question_id: index,
        option_choice: req.body["QUESTION_" + index],
        question_pass: false,
      });
    } else {
      break;
    }
    index++;
  }
  let submissionResponse;

  try {
    let result = await axios.post(
      examService + "/postSubmission",
      JSON.stringify({
        userID: req.query.USER_REG_ID,
        examID: req.query.examID,
        submission: userSubmissions,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    submissionResponse = result.data;
  } catch (error) {
    res.status(500).send({
      message: error,
    });
  }

  let examDetails;
  try {
    examDetails = await axios.get(examService + "/exams", {
      params: {
        examID: req.query.examID,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error,
    });
  }

  let examQuestions;
  try {
    let results = await axios.get(examService + "/questions", {
      params: {
        examID: req.query.examID,
      },
    });
    examQuestions = results.data.examQuestions;
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error,
    });
  }

  examQuestions = examQuestions.map((question) => {
    return {
      QUESTION: question.QUESTION,
      CORRECT_OPTION: question.OPTIONS.options.find((option) => {
        return option.valid === true;
      }),
    };
  });

  res.status(200).render("result", {
    userDetails: userDetails,
    userSubmission: submissionResponse.userSubmission,
    examDetails: examDetails,
    examQuestions: examQuestions,
  });
});

app.listen(4000, () => console.log("Client service has started on port 4000"));
