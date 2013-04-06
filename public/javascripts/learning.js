/**
 * @author hogesuke
 */
var LearningResultHolder = function(){
    this.resultArray = [];
}
LearningResultHolder.prototype.setResultCorrect = function(wordId, lvStatus){
    this.resultArray.push({
        word_id: wordId,
        answer: "correct",
        lv_status: lvStatus
    });
};

LearningResultHolder.prototype.setResultMistake = function(wordId, lvStatus){
    this.resultArray.push({
        word_id: wordId,
        answer: "mistake",
        lv_status: lvStatus
    });
};

LearningResultHolder.prototype.getResult = function(){
    return this.resultArray;
};

var learningResultHolder;

$(function(){

    countAllTestWords();

    $(".tag-link").live("click", function(){

        if ($("#learning-screen").hasClass("active")) {
           $('#quit-learning-label').trigger("click");
        }

        $(".selected-tag").removeClass("selected-tag");
        $(this).addClass("selected-tag");
        var $tagertTag = $("#target-tag");
        $tagertTag.children(".tag-name").text($(this).text());
        $tagertTag.attr("tag-id", $(this).attr("tag-id"));
        
        $("#category-selector").addClass("active");

        countWordsAtTag();
    });

    $(".category").live("click", function(){

        if ($("#category-selector").hasClass("disable")) {
            return;
        }

        if ($(this).children(".words-count").text() == "0") {
            return;
        }
        
        $(".category-opening-label").css("display", "inline");
        $(".category-closing-label").css("display", "none");

        $("#category-selector").addClass("disable");
        $(this).addClass("selected");
        
        var $cateogry = $(this);
        var $learningScreen = $("#learning-screen");
        $learningScreen.slideDown(300, function(){
            $learningScreen.css("display", "");
            $learningScreen.addClass("active");
            $("#quit-learning-label").show();
            getWords($cateogry.attr("category"));
        });
    });

    $("#quit-learning-label").live("click", function(){

        $(this).hide();
        $(".category-opening-label").css("display", "none");
        $(".category-closing-label").css("display", "inline");

        var $learningScreen = $("#learning-screen");
        $learningScreen.slideUp(300, function(){
            $learningScreen.removeClass("active");
            $learningScreen.css("display", "");

            $("#learning-panels").empty();
            
            var $categorySelector = $("#category-selector");
            $categorySelector.slideUp(100, function(){
                $categorySelector.css("display", "none");
                $categorySelector.removeClass("disable");
                $("#category-selector .selected").removeClass("selected");
            })

            $("#category-selector").slideDown(400, function(){
                $categorySelector.css("display", "");
            });

            $(".send-result-button").hide().attr("disabled", true);
            $(".answer-correct-button").show();
            $(".answer-mistake-button").show();
        });
    });

    function getWords(category){
        $.ajax({
            url: '/learning/get_words',
            type: 'GET',
            data: {
                "tag_id": $("#target-tag").attr("tag-id"),
                "category": category
            },
            timeout: 5000,
            success: function(data){
                var $learningWords = $("#learning-panels");
                $learningWords.empty();
                $learningWords.html(data.html);
                
                var $firstStep = $("#learning-panels [step-no=0]");
                $firstStep.addClass("active");
                $firstStep.effect("slide", {
                    direction: "right"
                }, 400);
                learningResultHolder = new LearningResultHolder();
            },
            error: function(){
                $('#status').html('サーバエラーが発生しました。');
            }
        });
    }
});

$(function(){
    $(".answer-correct-button").live("click", function(){
        settleAnswer("correct");
    });
    $(".answer-mistake-button").live("click", function(){
        settleAnswer("mistake");
    });
    function settleAnswer(answer) {
        var $step = $(".step.active");
        var currentLv = Number($step.attr("lv"));
        var newLv = getNewLv(currentLv, answer);
        var lvStatus = getStatus(answer, $step.attr("lv-up-chance"), currentLv);

        learningResultHolder.setResultMistake(Number($step.attr("word-id")), lvStatus);
        updateResultTable(Number($step.attr("step-no")), answer, lvStatus, newLv);
        switchStep("next");
    }
    function getStatus(answer, lvUpChance, currentLv) {
        if (!lvUpChance) {
            return "-";
        }
        if (answer == "correct") {
            return "up";
        }
        if (answer == "mistake" && currentLv == 1) {
            return "-";
        }
        return "down";
    }
    function getNewLv(currentLv, answer) {
        if (answer == "correct") {

            return currentLv + 1;
        } else if (answer == "mistake") {

            if (currentLv == 1) {
                return 1;
            }
            return currentLv - 1;
        }
    }
    function updateResultTable(stepNo, answer, lvStatus, lv){
        var $answerCell = $("[step-no=" + stepNo + "]");
        if(answer == "correct") {
            $answerCell.removeClass("mistake");
            $answerCell.addClass("correct");
        } else if (answer == "mistake") {
            $answerCell.removeClass("correct");
            $answerCell.addClass("mistake");
        }

        var $statusIcon = $("[step-no=" + stepNo + "] .status-icon");
        var $statusLv = $("[step-no=" + stepNo + "] .status-lv");
        $statusIcon.empty();
        $statusLv.empty();

        if (lvStatus == "up") {
            $statusIcon.text("h");
            $statusIcon.removeClass("mistake");
            $statusIcon.addClass("correct");
        } else if (lvStatus == "down") {
            $statusIcon.text("i");
            $statusIcon.removeClass("correct");
            $statusIcon.addClass("mistake");
        } else if (lvStatus == "-") {
            $statusIcon.text("g");
            $statusIcon.removeClass("mistake");
            $statusIcon.removeClass("correct");
        }

        $statusLv.text("Lv" + lv);
    }
});

$(function(){
    $(".send-result-button").live("click", function(){
        sendResult();
    });
    function sendResult(){
        $.ajax({
            url: '/learning/reflect_result',
            type: 'POST',
            data: {
                learning_result: learningResultHolder.getResult()
            },
            timeout: 5000,
            success: function(data){
                $('#status').text(data.notice);
                countWordsAtTag();
                countAllTestWords();
            },
            error: function(){
                       $('#status').text('サーバエラーが発生しました。');
                   },
            beforeSend: function(xhr){
                            xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
                        }
        });
    }
});

function switchStep(command){
    if (command != "previous" && command != "next") {
        return;
    }

    var $currentStep = $("#learning-panels .active");
    var currentStepNum = Number($currentStep.attr("step-no"));
    var toStepNum = getNextStepNum(command, currentStepNum);

    var $toStep = $("#learning-panels [step-no=" + toStepNum + "]");
    if (!$toStep.exists()) {
        return;
    }

    $correctBtn = $(".answer-correct-button");
    $mistakeBtn = $(".answer-mistake-button");
    $previousBtn = $(".previous-step-button");
    $nextBtn = $(".next-step-button");

    if ($toStep.hasClass("learning-result")) {
        $(".send-result-button").show().attr("disabled", false);
        $correctBtn.hide();
        $mistakeBtn.hide();
    } else if ($currentStep.hasClass("learning-result")) {
        $(".send-result-button").hide().attr("disabled", true);
        $correctBtn.show();
        $mistakeBtn.show();
   }

    $correctBtn.attr("disabled", true);
    $mistakeBtn.attr("disabled", true);
    $previousBtn.attr("disabled", true);
    $nextBtn.attr("disabled", true);

    $currentStep.removeClass("active");
    $toStep.addClass("active");

    $toStep.effect("slide", {
        direction: command == "next" ? "right" : "left"
    }, 400, function(){
        $correctBtn.attr("disabled", false);
        $mistakeBtn.attr("disabled", false);
        $previousBtn.attr("disabled", false);
        $nextBtn.attr("disabled", false);
    });

    var opneBlindDom = $currentStep.find(".blind .open");
    if (opneBlindDom.exists()) {

        switchBlind(opneBlindDom);
    }
}

function getNextStepNum(command, currentStepNum) {

    if (command == "previous") {

        return currentStepNum - 1;
    } else if (command == "next") {

        return currentStepNum + 1;
    }
}

function switchBlind(blindDom){
    if (blindDom.hasClass("close")) {

        var dispDescriptionDom = $(blindDom).closest(".step").find(".description .close");
        dispDescriptionDom.removeClass("close");
        dispDescriptionDom.addClass("open");

        blindDom.fadeOut(200, function(){
            $(blindDom).removeClass("close");
            $(blindDom).addClass("open");
        });
        return;
    } else if (blindDom.hasClass("open")) {

        blindDom.removeClass("open");
        blindDom.addClass("close");
        blindDom.css("display", "");

        var blindDescriptionDom = blindDom.closest(".step").find(".description .open");
        blindDescriptionDom.removeClass("open");
        blindDescriptionDom.addClass("close");
    }
}

$(function(){
    $(".previous-step-button").live('click', function(){
        switchStep("previous");
    });
    $(".next-step-button").live('click', function(){
        switchStep("next");
    });
});

$(function(){
    $(".blind .close").live("click", function(){
        switchBlind($(this));
    });
});

$(function(){
    var category = getUrlVar("category");

    if (category == undefined) {
        return;
    }
    if (category != "learning" && category != "test") {
        return;
    }
    if ($("[category=" + category + "] .words-count").text() == "0") {
        return;
    }

    $("#category-selector").addClass("disable");
    $(".category").addClass("selected");

    $category = $("[category=" + category + "]");
    setTimeout(function(){
        $category.addClass("blink");
        setTimeout(function(){
            $category.removeClass("blink");
        }, 150);
    }, 300);

    setTimeout(function(){
        $("#category-selector").removeClass("disable");
        $(".category").removeClass("selected");
        $category.trigger("click");
    }, 650);
    
});
