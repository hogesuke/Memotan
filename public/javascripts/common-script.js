jQuery.fn.exists = function(){
    return this.length > 0;
}

function trim(str){
    str = str.replace(/\r\n/g, "");
    str = str.replace(/\n/g, "");
    str = jQuery.trim(str);

    return str;
}

$(function(){
    var nav = $('#global-nav-holder');
    //navの位置   
    var navTop = nav.offset().top;
    //スクロールするたびに実行
    $(window).scroll(function(){
        var winTop = $(this).scrollTop();
        //スクロール位置がnavの位置より下だったらクラスfixedを追加
        if (winTop >= navTop) {
            nav.removeClass('absolute');
            nav.addClass('fixed');
        } else if (winTop <= navTop) {
            nav.removeClass('fixed');
            nav.addClass('absolute');
        }
    });
});

$(function(){
    $("#search-box").keypress(function(e) {
        if(e.which == 13) {

            $(window).unbind("bottom");
            $('#list #pages').empty();

            $(".selected-tag").removeClass("selected-tag");
            $("[tag-id=-1]").addClass("selected-tag");

            wordLoader = new WordLoader(
                1,
                -1,
                $("#search-box").val(),
                $('.sort-selected').attr('sort-key'),
                $('.sort-selected').attr('order')
                );
            wordLoader.loadWords().then(function(){
                bindBottomAction();
            });
        }
    });

    $("#search-box").focus(function() {
        if($(this).val() == $(this).attr('default-value')){
            $(this).val('');
            $(this).removeClass("web-icon-fontello");
        }
    }).blur(function() {
        if(jQuery.trim($(this).val()) == "") {
            $(this).addClass("web-icon-fontello");
            $(this).val($(this).attr('default-value'));
       }
    });
});

function countAllTestWords(){
    $.ajax({
        url: '/learning/count_all_test_words',
        type: 'GET',
        data: {
            "tag_id": $("#target-tag").attr("tag-id"),
        },
        timeout: 5000,
        success: function(data){
            var $allTestWordsCount = $("#test-words-count");
            $allTestWordsCount.empty();
            $allTestWordsCount.text(data.count_of_all_test);
        },
        error: function(){
                   $('#status').html('サーバエラーが発生しました。');
               }
    });
} 

function countWordsAtTag(){
    $.ajax({
        url: '/learning/count_words_at_tag',
    type: 'GET',
    data: {
        "tag_id": $("#target-tag").attr("tag-id"),
    },
    timeout: 5000,
    success: function(data){
        var $learningWordsCount = $("[category='learning'] .words-count");
        $learningWordsCount.empty();
        $learningWordsCount.text(data.count_of_learning);

        var $testWordsCount = $("[category='test'] .words-count");
        $testWordsCount.empty();
        $testWordsCount.text(data.count_of_test);
    },
    error: function(){
               $('#status').html('サーバエラーが発生しました。');
           }
    });
}

function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getUrlVar(name){
    return getUrlVars()[name];
}
