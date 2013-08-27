/**
 *
 * WordsViewで使用するJavaScript。
 *
 * @author hogesuke
 */

var LOAD_COUNT_PER_PAGE = 3;

var WordLoader = function(startPage, tagId, searchKey, sortKey, order){
    this.nextPageNumber = startPage;
    this.tagId = tagId;
    this.searchKey = searchKey;
    this.sortKey = sortKey;
    this.order = order;
};

/**
 * WordLoaderクラス。
 *
 * wordリストを取得する。
 */
WordLoader.prototype.loadWords = function(){

    $('#loading-img').html('<img src="/images/ajax-loader.gif">');

    var param = {
        'page': this.nextPageNumber
    };
    
    // 引数で指定されたtag_idがundefined または -1の場合、タグによる絞り込みを行わない。
    if (typeof this.tagId !== "undefined" && this.tagId != -1) {
        param['tag_id'] = this.tagId;
    }
    
    if (typeof this.searchKey !== "undefined") {
        param['search_key'] = this.searchKey;
    }

    if (typeof this.sortKey !== "undefined" &&
            typeof this.order !== "undefined" &&
            this.sortKey.match(/spelling|level|created_at/) &&
            this.order.match(/asc|desc/)) {
        param['sort_key'] = this.sortKey;
        param['order'] = this.order;
    }

    if (typeof this.searchKey !== "undefined") {
        param['search_key'] = this.searchKey;
    }

    var aplly = function(increasePageNum) {
        return function(data) {
            if (data.status == 'completed') {
                $(window).unbind("bottom");
                $('#loading-img').html("");
                return;
            }
            $('#list #pages').append("<div class='list-page' page='" + data.page + "'></div>");
            $('[page=' + data.page + ']').append(data.html);
            $('#loading-img').html("");
        }
    };

    /* TODO リストの読み込みの成否に関わらずインクリメントしているため、
     * 読み込み失敗時のリトライが行われない。
     */
    this.increasePageNum();

    return $.ajax({
        url: "/words/list",
        type: 'POST',
        data: param,
        timeout: 10000,
        success: aplly(this.increasePageNum),
        error: function(){
            $().toastmessage('showErrorToast', '単語一覧の取得に失敗しました。ページを再読み込みしてください。');
            $('#loading-img').empty();
        },
        beforeSend: function(xhr){
            xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
        }
    }).then(function(){
        var $target = $("[page=" + (wordLoader.getNextPageNum() - 1) + "] .word-card");
        $target.loadLevelProgressBar();
    });
};

WordLoader.prototype.increasePageNum = function() {
    this.nextPageNumber = this.nextPageNumber + 1
};

WordLoader.prototype.getNextPageNum = function() {
    return this.nextPageNumber;
};

var wordLoader;

/**
 * Wordリスト画面初期表示処理
 */
$(function(){

    wordLoader = new WordLoader(2);

    bindBottomAction();
    $().toastmessage({ position: 'top-center', stayTime: 5000 });

    $("[page=1] .word-card").loadLevelProgressBar();

    /**
     * ナビゲーションバーのボタンを共通clickイベントをバインド。
     */
    $('#global-nav-holder .tool-btn, .word-del-btn,.edit-btn, .spelling').live('click', function(){
        // 既に表示されている削除バーを片付ける
        $('.word-del-bar').remove();
        $('.word-card').find('.word-del-btn').css('display', 'inline');
        $('.word-card').find('.edit-btn').css('display', 'inline');
    });

    /**
     * wordの新規作成ボタンにclickイベントをバインド。
     */
    $('#create-word-btn').click(function(){
        $.ajax({
            url: '/words/new',
            type: 'POST',
            timeout: 5000,
            success: function(data){
                var $form = $("#form");
                $form.empty();
                $form.html(data.html);
                $form.modal();
                $('#rewikibtn').attr('disabled', true);
            },
            error: function(){
                // TODO エラーメッセージを手直しすること。
                $('#form-msg-area').html('単語の登録に失敗しました。');
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
            }
        }).then(function(){
            bindPagingTagList();
        });
    });

    /**
     * wordの編集ボタンにclickイベントをバインド。
     */
    $('.edit-btn').live("click", function(){
        var edited_id = parseInt($(this).closest('div .word-card').attr('word-id'));

        $.ajax({
            url: '/words/' + edited_id + '/edit',
            type: 'POST',
            timeout: 5000,
            success: function(data){
                var $form = $("#form");
                $form.empty();
                $form.html(data.html);
                $form.modal();
                $('#rewikibtn').attr('disabled', true);
            },
            error: function(){
                $().toastmessage('showErrorToast', '単語の取得に失敗しました。一度、ページを更新してください。');
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
            }
        }).then(function(){
            bindPagingTagList();
        });
    });

    /**
     * wordの削除ボタンにclickイベントをバインド。
     */
    $('.word-del-btn').live("click", function(){
        var $deleteCard = $(this).closest('div .word-card');
        var $deleteBar = $('<div class="word-del-bar">' +
                           '<span>delete?</span>' +
                           '<a class="word-del-ok" href="javascript:void(0)">ok</a>' +
                           '<a class="word-del-cancel" href="javascript:void(0)">cancel</a></div>');
        $(this).closest('div .word-card').append($deleteBar);

        $deleteBar.position({
            my: 'right bottom',
            at: 'right bottom',
            of: $deleteCard
        });
        $(this).css('display', 'none');
        $(this).siblings('.edit-btn').css('display', 'none');
    });

    /**
     * wordの削除okボタンにclickイベントをバインド。
     */
    $('.word-del-ok').live("click", function(){
        var $deleteCard = $(this).closest('div .word-card');
        var delete_id = parseInt($deleteCard.attr('word-id'));
        $(this).closest('.word-del-bar').remove();
        $.ajax({
            url: '/words/' + delete_id,
            type: 'DELETE',
            timeout: 5000,
            success: function(data){
            
                if (data.status == "success") {
                    $deleteCard.slideUp("normal", function(){
                        $deleteCard.remove()
                    });
                    return;
                }
            },
            error: function(){
                $().toastmessage('showErrorToast', '単語の削除に失敗しました。一度、ページを更新してください。');
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
            }
        });
    });

    /**
     * wordの削除キャンセルボタンにclickイベントをバインド。
     */
    $('.word-del-cancel').live("click", function(){
        $(this).closest('.word-card').find('.word-del-btn').css('display', 'inline');
        $(this).closest('.word-card').find('.edit-btn').css('display', 'inline');
        $(this).closest('.word-del-bar').remove();
    });

    /**
     * word登録Formの登録ボタンにclickイベントをバインド。
     */
    $('#word_submit').live("click", function(){
        $('#form-sending-img').html('<img src="/images/form-loader.gif">');
        $('#form-msg-area').empty();
        $('#create-dialog .validation-error').removeClass('validation-error');

        var msgArray = new Array();

        var wordSpell = $('#word_spelling').val();
        if (!wordSpell) {

            msgArray.push('単語が入力されていません。');
            $('#word_spelling').addClass('validation-error');
        } else if (25 < wordSpell.length) {

            msgArray.push('単語は25文字以内で入力してください。');
            $('#word_spelling').addClass('validation-error');
        }

        var wordDescription = $('#word_description').val();
        if (wordDescription && 256 < wordDescription.length) {

            msgArray.push('意味は256文字以内で入力してください。');
            $('#word_description').addClass('validation-error');
        }

        if (msgArray.length) {
            
            var $msgDom = $('<ul>');
            $.each(msgArray, function(i, value) {
                $msgDom.append($('<li>').text(value));
            });
            $('#form-msg-area').append($msgDom);
            $('#form-sending-img').empty();
            return false;
        }

         var tagsLabel = "";
         $("#tag-list-for-form .tag-li .tag-label").each(function(){
             tagsLabel += $(this).text() + " ";
         });
         $("*[name=tags_label]").val(tagsLabel);
    });

    /**
     * Wikipediaボタンにclickイベントをバインド。
     */
    $('#wikibtn').live("click", function(){
        $('#form-msg-area').html('Wikipediaより取得中...');
        var subject = $('#word_spelling').val();
        $.ajax({
            url: 'http://ja.wikipedia.org/w/api.php?action=parse&page=' + encodeURIComponent(subject) + '&format=json',
            type: 'GET',
            dataType: 'jsonp',
            timeout: 10000,
            jsonp: 'callback',
            success: function(data){
                try {
                    var text = data.parse.text["*"];
                } 
                catch (e) {
                    $('#form-msg-area').html('Wikipediaの記事が見つかりませんでした。');
                    return;
                }
                
                var matchedText = text.match(/<\/table>\n<p>([\w\W]*?)<\/p>\n<table id="toc" class="toc">/m);
                var extractedText = RegExp.$1;
                if (matchedText == null) {
                    $('#form-msg-area').html('Wikipediaの記事が見つかりませんでした。');
                    return;
                }

                articleText = extractedText.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
                wikipediaArticleHolder = new WikipediaArticleHolder(articleText);

                var sentence = wikipediaArticleHolder.getSentence();
                if (sentence == undefined) {
                    return;
                }
                var $wordDescription = $('#word_description');
                $wordDescription.attr("value", $wordDescription.attr("value") + sentence);

                if (!wikipediaArticleHolder.isOver()) {
                    $('#rewikibtn').attr('disabled', false);
                }
                $('#form-msg-area').html('Wikipediaから記事を取得しました。');
            },
            error: function(){
                $('#form-msg-area').html('Wikipediaとの通信中にエラーが発生しました。');
            }
        });
    });

    /**
     * wikipediaさらに取得ボタンにclickイベントをバインド。
     */
    $('#rewikibtn').live("click", function(){
        var sentence = wikipediaArticleHolder.getSentence();
        var $wordDescription = $('#word_description');
        $wordDescription.attr("value", $wordDescription.attr("value") + sentence);
        if (wikipediaArticleHolder.isOver()) {
            $('#rewikibtn').attr('disabled', true);
        }
    })

    /**
     * タグ入力テキストボックスにkeypressイベントをバインド。
     */
    $("#tag-text-box").live("keypress", function(e) {
        $("#tag-text-box").removeClass("validation-error");
        // Enterキー押下時の処理
        if(e.which == 13) {
            var $tagItem = $(".tag-item");
            if ($tagItem.size() >= 5) {
                return $("#form-msg-area").text("タグの選択は５つまでです。");
            }
            var label = $(this).val();
            if (label == "") {
                return;
            }
            if (label.match(/\s/)) {
                $("#form-msg-area").text("タグにはスペースを使用できません。");
                $("#tag-text-box").addClass("validation-error");
                return;
            }
            if (isAlreadySelectedTag(label, $("#tag-list-for-form .tag-li .tag-label"))) {
                $("#form-msg-area").text("すでに選択されているタグです。");
                $("#tag-text-box").addClass("validation-error");
                return;
            }

            addTagToForm(label);
            $(this).val("");
        }
    });

    /**
     * タグ入力テキストボックスにfocusイベントをバインド。
     */
    $("#tag-text-box").live("focus", function() {
        if($(this).val() == $(this).attr('default-value')){
            $(this).val('');
            $(this).removeClass("empty");
        }
    })

    /**
     * タグ入力テキストボックスにblurイベントをバインド。
     */
    $("#tag-text-box").live("blur", function() {
        if(jQuery.trim($(this).val()) == "") {
            $(this).val($(this).attr('default-value'));
            $(this).addClass("empty");
        }
    });

    /**
     * タグ追加ボタンにclickイベントをバインド。
     */
    $('#tag-drop-area .tag-li').live("click", function(){
        var label = $(this).find(".tag-label").text();
        if (isAlreadySelectedTag(label, $("#tag-list-for-form .tag-li .tag-label"))) {
            return;
        }
        addTagToForm(label);
    });

    /**
     * タグ削除ボタンにclickイベントをバインド。
     */
    $(function(){
        $('.tag-del-btn').live("click", function(){
            $removeTag = $(this).closest(".tag-li");
            $removeTag.fadeOut(150, function(){
                $removeTag.remove();
            });
        });
    });

    /**
     * タグリンクにclickイベントをバインド。
     */
    $('.tag-link').live('click', function(){
    
        $(window).unbind("bottom");
        $('#list #pages').empty();
        $('#new-words').empty();
        
        $(".selected-tag").removeClass("selected-tag");
        $(this).addClass("selected-tag");
        
        var tagId = $(this).attr('tag-id');
        
        wordLoader = new WordLoader(1,
            tagId,
            undefined,
            $('.sort-selected').attr('sort-key'),
            $('.sort-selected').attr('order')
            );
        wordLoader.loadWords().then(function(){
            bindBottomAction();
        });
    });

    /**
     * wordカードのスペルにclickイベントをバインド。
     */
    $('.word-card .word-content .spelling').live('click', function(){
        $(this).siblings('.description').slideToggle(150)
        $(this).closest('.word-card').find('.word-del-bar').remove();
        $(this).closest('.word-card').find('.word-del-btn').css('display', 'inline');
        $(this).closest('.word-card').find('.edit-btn').css('display', 'inline');
    });

    /**
     * wordカードの開閉スイッチにclickイベントをバインド。
     */
    $("#list-switch-btn").live("click", function(){
    
        if ($(this).hasClass("open-btn")) {
        
            $(".description").css("display", "block");
            $(this).removeClass("open-btn");
            $(this).addClass("close-btn");
            $("#pages").removeClass("full-close");
            $("#pages").addClass("full-open");
        } else if ($(this).hasClass("close-btn")) {
        
            $(".description").css("display", "none");
            $(this).removeClass("close-btn");
            $(this).addClass("open-btn");
            $("#pages").removeClass("full-open");
            $("#pages").addClass("full-close");
        }
    });

    /**
     * レベルアップボタンにclickイベントをバインド。
     */
    $(".level-up-btn").live("click", function() {
        changeLevel(this, "levelUp");
    });

    /**
     * レベルダウンボタンにclickイベントをバインド。
     */
    $(".level-down-btn").live("click", function() {
        changeLevel(this, "levelDown");
    });

    /**
     * ソートナビ表示スイッチにclickイベントをバインド。
     */
    $("#sort-btn").live("click", function(){
    
        if ($(this).hasClass("open-btn")) {
        
            $("#sort-nav-holder").slideDown(200);
            $(this).removeClass("open-btn").addClass("close-btn");
        } else if ($(this).hasClass("close-btn")) {
        
            $("#sort-nav-holder").slideUp(200);
            $(this).removeClass("close-btn").addClass("open-btn");
        }
    });

    /**
     * ソートリンクにclickイベントをバインド。
     */
    $('#sort-nav a').live("click", function(){

        $(window).unbind("bottom");
        $('#list #pages').empty();
        $('#new-words').empty();

        wordLoader = new WordLoader(
            1,
            $('.selected-tag').attr('tag-id'),
            undefined,
            $(this).attr('sort-key'),
            $(this).attr('order')
            );

        $('.sort-selected').css({'padding':'8px 13px'});
        $('.sort-selected').removeClass('sort-selected');
        $(this).addClass('sort-selected');
        $(this).css({'padding':'8px 9px'});

        wordLoader.loadWords().then(function(){
            bindBottomAction();
        });
    });
});

/**
 * word新規作成ウィンドウにタグヒストリー選択エリアの表示をバインド。
 */
function bindPagingTagList(){
    $("#tag-drop-area").pajinate({
        num_page_links_to_display: 4,
        items_per_page: 7,
        item_container_id: ".tag-content",
        nav_panel_id: ".tag-page-navi",
        nav_label_first: '<<',
        nav_label_last: '>>',
        nav_label_prev: '<',
        nav_label_next: '>'
    });
    $("#tag-container").hover(function(){
        $("#tag-drop-area").slideDown(200);
    }, function(){
        $("#tag-drop-area").hide();
    });
    $('#tag-drop-area').hide();
}

/**
 * wikipedia記事取得クラス。
 */
var WikipediaArticleHolder = function(articleText){
    this.sentenceArray = articleText.split("。");
    this.nextIndex = 0;
}

WikipediaArticleHolder.prototype.getSentence = function(){
    var sentence = this.sentenceArray[this.nextIndex++];
    return trim(sentence) + "。";
};

WikipediaArticleHolder.prototype.isOver = function(){
    if (this.nextIndex == this.sentenceArray.length - 1) {
        return true;
    }
    return false;
};

var wikipediaArticleHolder;

/**
 * 選択タグエリアにタグを追加。
 */
function addTagToForm(tagLabel) {

    var addhtml = $("#tmpl-of-tag-li").tmpl({
        label: tagLabel
    });
    $("#tag-list-for-form ul").append(addhtml);
}

/**
 * 既に選択されたタグか判別する。
 */
function isAlreadySelectedTag(tagLabel, objs){

    var alreadySelected = false;
    objs.each(function(){
        var selectedTagLabel = $(this).text();
        if (tagLabel == selectedTagLabel) {
            alreadySelected = true;
            return;
        }
    });
    return alreadySelected;
}

/**
 * 画面下端までスクロール時のイベントをバインド。
 */
function bindBottomAction(searchKey){

    $(window).bottom({
        proximity: 0.05
    });
    $(window).on('bottom', function(){
    
        var obj = $(this);
        if (!obj.data('loading')) {
        
            obj.data('loading', true);

            var nextPageNum = parseInt($('#list .list-page:last').attr('page')) + 1;
            var tag_id = $('.selected-tag').attr('tag-id');
            
            wordLoader.loadWords().then(function(){
                obj.data('loading', false);
            });
        }
    });
}

/**
 * Enter押下時にFormの送信を行わない用にする。
 */
function blockEnter(evt){
    evt = (evt) ? evt : event; 
    var charCode=(evt.charCode) ? evt.charCode : 
        ((evt.which) ? evt.which : evt.keyCode);
    if ( Number(charCode) == 13 || Number(charCode) == 3) {
        return false;
    } else {
        return true;
    }
}

/**
 * ワードのレベルアップ/ダウンを行う。
 */
function changeLevel(context, method) {

    var wordId = parseInt($(context).closest('div .word-card').attr('word-id'));
    var param = {
        'word_id': wordId
    };

    $.ajax({
        url: method == 'levelUp' ? '/words/level_up' : '/words/level_down',
        type: 'POST',
        data: param,
        timeout: 5000,
        jsonp: 'callback',
        success: function(data){
            $wordCard = $("[word-id=" + wordId + "]");
            $wordCard.attr("level", data.after_lv);
            $wordCard.find(".level-label").text("習得Lv." + Number(data.after_lv));
            $wordCard.loadLevelProgressBar();
        },
        error: function(){
            $().toastmessage('showErrorToast', '単語の取得に失敗しました。一度、ページを更新してください。');
        },
        beforeSend: function(xhr){
            xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
        }
    });
}

(function($){

    var maxLevel;

    /**
     * wordのレベルバーを読み込む。
     */
    $.fn.loadLevelProgressBar = function() {

        /*
         * Levelの最大値をDBより取得する。
         */
        function selectMaxLevel() {
            return $.ajax({
                url: "/learning_levels/select_max_level",
                type: "POST",
                timeout: 5000,
                success: function(data){
                    maxLevel = Number(data.max_level);
                },
                error: function(){
                    $('#main-msg-area').html('サーバエラーが発生しました。');
                },
                beforeSend: function(xhr){
                    xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
                } 
            });
        }

        /**
         * プログレスバーを描画する。
         */
        function draw(target) {
            var currentLevel = Number($(target).attr("level"));
            var percentOfIncrease = Math.round(100/maxLevel);
            var percent;
            if (currentLevel == maxLevel) {
                percent = 100;
            } else {
                percent = percentOfIncrease * currentLevel;
            }

            var $progressbar = $(target).find(".lvProgressBar");
            $progressbar.progressbar();
            $progressbar.progressbar("option", "value", percent);
        }

        // 初回のみ最大レベルを取得する。
        if (typeof maxLevel === 'undefined') {
            var _this = this;
            selectMaxLevel().then(function() {
                return _this.each(function() {
                    draw(this);
                });
            });
        }
        return this.each(function() {
            draw(this);
        });
    }
})(jQuery);
