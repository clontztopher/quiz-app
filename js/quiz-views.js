var quiz = quiz || {};

quiz.Views = function(){

    $message = $('#message');

    Handlebars.registerHelper('checkChoice', function(choice, text, options){
        if(choice == text){
            return options.fn(this);
        }
    });

    this.buttons = function(data){
        $('#button-container').remove();
        this.render('#button-template', '#buttons', data);
    };

    this.question = function(data){
        this.render('#question-template', '#main-output', data);
        quiz.emitter.off('render:question');
    };
    
    this.results = function(data){
        this.render('#results-template', '#main-output', data);
    };
    
    this.message = function(data){
        $message.find('#message-wrap').remove();
        this.render('#message-template', '#message', data);
        $message.slideDown().delay(3000).slideUp();
    };

    this.render = function(sourceId, outputId, data) {
        var source = $(sourceId).html();
        var template = Handlebars.compile(source);
        var compiledHTML = template(data);
        $(outputId).append(compiledHTML);
    };

    this.replace = function(data){
        var self = this;
        var container = $('#main-output');
        container.addClass('up');
        setTimeout(function(){
            $('.template').remove();
            switch(data.type){
                case 'question':
                    self.question(data.question);
                    break;
                case 'results':
                    self.results(data);
                    break;
            }
            container.removeClass('up');
        }, 500);
    };

    quiz.emitter.on('render:question', this.question.bind(this));
    quiz.emitter.on('replace', this.replace.bind(this));
    quiz.emitter.on('update:buttons', this.buttons.bind(this));
    quiz.emitter.on('alert:noAnswer', this.message.bind(this));
};

