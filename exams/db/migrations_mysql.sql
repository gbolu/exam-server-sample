CREATE SCHEMA EXAMS_SERVER;

CREATE TABLE EXAMS_SERVER.STUDENTS(
    ID INT AUTO_INCREMENT,
    USER_REG_ID INT NOT NULL,
    CREATED_AT DATETIME NOT NULL DEFAULT NOW(),
    UPDATED_AT DATETIME NOT NULL DEFAULT NOW(),
    DISPLAY_NAME TEXT NOT NULL,
    PRIMARY KEY(ID)
)

CREATE TABLE EXAMS_SERVER.EXAMS(
    ID INT AUTO_INCREMENT NOT NULL,
    CREATED_AT DATETIME NOT NULL DEFAULT NOW(),
    UPDATED_AT DATETIME NOT NULL DEFAULT NOW(),
    EXAM_NAME TEXT NOT NULL,
    PRIMARY KEY(ID)
)

CREATE TABLE EXAMS_SERVER.QUESTIONS(
    QUESTION_ID INT AUTO_INCREMENT,
    EXAM_ID INT NOT NULL,
    PRIMARY KEY(QUESTION_ID),
    /**
    OPTIONS OBJECT - {
    [
        "VALID": BOOLEAN,
        "OPTION_TEXT": "THE OPTION IN TEXT"
    ]
    }
    */
    QUESTION TEXT,
    OPTIONS JSON,
    FOREIGN KEY (EXAM_ID) REFERENCES EXAMS_SERVER.EXAMS(ID)
)

drop table EXAMS_SERVER.QUESTIONS