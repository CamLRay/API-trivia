import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';
let sessionToken = "";

function 

const sessionTokenGenerator = () => {
  let sessionRequest = new XMLHttpRequest();
  const url = `https://opentdb.com/api_token.php?command=request`;
  sessionRequest.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      sessionToken = JSON.parse(this.responseText);
      sessionToken = sessionToken.token;
    }
  };
  sessionRequest.open("GET", url, true);
  sessionRequest.send();
};

$(document).ready(function() {
  sessionTokenGenerator();
  let categoryRequest = new XMLHttpRequest();
  const url = `https://opentdb.com/api_category.php`;
  categoryRequest.onreadystatechange = function () {
    if(this.readyState === 4 && this.status === 200) {
      const categories = JSON.parse(this.responseText);
      displayCategories(categories["trivia_categories"]);
    }
  };
  categoryRequest.open("GET", url, true);
  categoryRequest.send();

  $("form").submit(function(event){
    event.preventDefault();
    const category = $("#category").val();
    const difficulty = $("#difficulty").val();
    let questionRequest = new XMLHttpRequest();
    let url =`https://opentdb.com/api.php?amount=1&category=${category}&difficulty=${difficulty}&token=${sessionToken}`;
    questionRequest.onreadystatechange = function () {
      if(this.readyState === 4 && this.status === 200) {
        const question = JSON.parse(this.responseText);
        if (question["response_code"] === 4) {
          let refreshRequest = new XMLHttpRequest();
          let refreshURL = `https://opentdb.com/api_token.php?command=reset&token=${sessionToken}`;
          
          refreshRequest.open("GET", refreshURL, true);
          refreshRequest.send();
        } else {
          displayQuestion(question.results[0], decodeHTMLCharCodes(question.results[0]["correct_answer"]));
        }
      }
    };
    questionRequest.open("GET", url, true);
    questionRequest.send();
  });
});

function displayCategories(categories) {
  let dropDown = "<select id='category'>";
  categories.forEach(function(category){
    dropDown += `<option value=${category.id}>${category.name}</option>`;
  });
  $("form").prepend(`${dropDown}</select>`);
}

function displayQuestion(question, correctAnswer) {
  let answers = shuffleAnswers(question["incorrect_answers"].concat(question["correct_answer"]));
  let questionCard = `<div class='card'><h5 class='card-title'>${question.question}</h5><ul class='list-group list-group-flush'></ul></div>`;
  $("#output").html(questionCard);

  let answerOutput = $("ul");
  answerOutput.on("click", function() {
    let total = parseInt($("#total").text());
    $("#total").text(++total);
    let answerTags = $("li");
    answerTags.off("click");
    for (let i = 0; i < answerTags.length; i++) {
      let answerTag = answerTags[i];
      if(answerTag.textContent === correctAnswer) {
        answerTag.classList.add("right");
      } else {
        answerTag.classList.add("wrong");
      }
    }
  });
  answers.forEach((answer) => {
    let answerTag = $(`<li class='list-group-item'>${answer}</li>`);
    answerTag.on("click", function() {
      if ($(this).text() === correctAnswer) {
        let score = parseInt($("#score").text());
        $("#score").text(++score);
      }
    });

    answerOutput.append(answerTag);
  });
}

function shuffleAnswers(answers) {
  if (answers.length !== 2) {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = answers[i];
      answers[i] = answers[j];
      answers[j] = temp;
    }
  } else {
    if (answers[0].toLowerCase() === "false") {
      let temp = answers[0];
      answers[0] = answers[1];
      answers[1] = temp;
    }
  }

  return answers;
}

function decodeHTMLCharCodes(html) {
  let text = document.createElement("textarea");
  text.innerHTML = html;
  return text.value;
}