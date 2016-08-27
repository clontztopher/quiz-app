var quiz = quiz || {};

var QuizApp = function(dataURL){
    
  var $buttons = $('#buttons'),
        $main = $('#main-output');

  function init(dataURL){
    quiz.views.buttons({control: true});
    $.get(dataURL, function(data){
        data.forEach(function(question){
            questionCollection.allQuestions
                .push(new QuestionModel(question));
        });
        quiz.emitter.emit(
            'render:question', 
            questionCollection.first()
        );
    });
  };

  //Create a collection to hold all questions, populated by 'init'
  var questionCollection = {
    allQuestions: [],
    results: function(){
      var numCorrect = this.allQuestions.filter(function(question){
          return question.correct === question.choice;
      }).length;
      return numCorrect;
    },
    update: function(choice){
      this.currentQuestion().choice = choice;
    },
    checkForAnswer: function(){
      return this.currentQuestion().choice;
    },
    loadNext: function(data){
      if(this.currentQuestion().choice){
        if(this.hasNext()){
          quiz.emitter.emit('replace', {type: 'question', question: this.next()});
        } else {
          quiz.emitter.emit('replace', 
            {
              type: 'results',
              total: this.allQuestions.length,
              score: this.results()
            }
          );
          quiz.emitter.emit('update:buttons', { control: false });
        }
      } else {
        quiz.emitter.emit('alert:noAnswer', { text: "Did you select an answer?" });
      }
    },
    loadPrevious: function(){
      if(this.hasPrev()){
        quiz.emitter.emit('replace', {type: 'question', question: this.prev()})
      } else {
        quiz.emitter.emit('alert:noAnswer', { text: "This is the first question." });
      }
    },
    currentNumber: 0,
    currentQuestion: function(){
      return this.allQuestions[this.currentNumber];
    },
    first: function(){
      this.currentNumber = 0;
      return this.currentQuestion();
    },
    hasNext: function(){
      return this.currentNumber < this.allQuestions.length - 1;
    },
    next: function(){
      var next = this.currentNumber += 1;
      return this.allQuestions[next];
    },
    hasPrev: function(){
      return this.currentNumber > 0;
    },
    prev: function(){
      var prev = this.currentNumber -= 1;
      return this.allQuestions[prev];
    },
    reset: function(){
      this.allQuestions.forEach(function(question){
          question.choice = null;
      });
      this.current = 0;
      quiz.views.buttons({control: true});
      quiz.emitter.emit(
        'replace', 
        {
          type: 'question',
          question: questionCollection.first()
        }
      );
    }
  };
    
  var QuestionModel = function(question){
    this.choice = null;
    this.question = question.question;
    this.answers = question.answers;
    this.correct = question.correct;
  };


  function answerHandler($target){
    var choice = $target.text().trim();
    $target.addClass('chosen')
      .siblings()
      .removeClass('chosen');
    quiz.emitter.emit('update:selection', choice);
  };
  $main.on('click', '.answer', function(){
    var $target = $(this);
    answerHandler($target);
  });

  quiz.emitter.on('update:selection', questionCollection.update.bind(questionCollection));


  $buttons.on('click', 'button', quizControl);
  
  function quizControl(event) {
    var buttonType = event.target.dataset.control;
    quiz.emitter.emit('update:quiz', buttonType);
  }

  quiz.emitter.on('update:quiz', selectView);
  
  function selectView(type){
    switch(type){
      case 'next' : return questionCollection.loadNext();
      case 'prev' : return questionCollection.loadPrevious();
      case 'reset': return questionCollection.reset();
    }
  }

  init(dataURL);
};

$(document).ready(function(){
  quiz.emitter = new Emitter();
  quiz.views = new quiz.Views();
  quiz.start = new QuizApp('js/data/quizQuestions.json');
});