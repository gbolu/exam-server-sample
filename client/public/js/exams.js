const radioInputs = document.querySelectorAll(".userSubmissions");

const amtquestions = document.querySelectorAll(".questions").length;

const submitBtn = document.querySelector("#btn_submit");

document.addEventListener("click", (ev) => {
  if (ev.target === submitBtn) {
    let clickedOptions = 0;

    radioInputs.forEach((element) => {
      if (element.checked) {
        clickedOptions += 1;
      }
    });

    if (clickedOptions !== amtquestions) {
      ev.preventDefault();
      alert("Please attempt all questions");
    }
  }
});
