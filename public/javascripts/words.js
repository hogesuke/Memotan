/**
 * WordsViewで使用するJavaScript。
 *
 * @author hogesuke
 */

var LOAD_COUNT_PER_PAGE = 3;

var WordLoader = function(startPage, tagId, searchKey){
    this.nextPageNumber = startPage;
    this.tagId = tagId;
    this.searchKey = searchKey;
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
    
    if (typeof searchKey !== "undefined") {
        param['search_key'] = this.searchKey;
    }

    var action = function(increasePageNum) {
        return function(data) {
            if (data.status == 'completed') {
                $(window).unbind("bottom");
                $('#loading-img').html("");
                return;
            }
            $('#list #pages').append("<div class='list-page' page='" + data.page + "'></div>");
            $('[page=' + data.page + ']').append(data.html);
            $('#loading-img').html("");
            //increasePageNum();
        }
    };

    /* TODO リストの読み込みの成否に関わらずインクリメントしているため、
     * 読み込み失敗時のリトライが行われない。
     */
    this.increasePageNum();

    return $.ajax({
        url: "/words/list",
        type: 'GET',
        data: param,
        timeout: 5000,
        success: action(this.increasePageNum),
        error: function(){
            $('#main-msg-area').html('サーバエラーが発生しました。');
        }
    });
    /** 2013/04/09 最小リリースのためコメントアウト
    }).then(function(){
        loadLevelProgressBar(this.nextPageNumber);
    });
    **/
};

WordLoader.prototype.increasePageNum = function() {
    this.nextPageNumber = this.nextPageNumber + 1
};

var wordLoader;

/**
 * Wordリスト画面初期表示処理
 */
$(function(){
    countAllTestWords();
    /** 2013/04/09 最小リリースのためコメントアウト **/
    // loadLevelProgressBar(1);
    wordLoader = new WordLoader(2);

    bindBottomAction();

    /**
     * wordの新規作成ボタンにclickイベントをバインド。
     */
    $('#create-word-btn').click(function(){
        $.ajax({
            url: '/words/new',
            type: 'GET',
            timeout: 5000,
            success: function(data){
                $form = $("#form");
                $form.empty();
                $form.html(data.html);
                $form.modal();
                $('#rewikibtn').attr('disabled', true);
            },
            error: function(){
                // TODO エラーメッセージを手直しすること。
                $('#form-msg-area').html('単語の登録に失敗しました。');
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
            type: 'GET',
            timeout: 5000,
            success: function(data){
                var $form = $("#form");
                $form.empty();
                $form.html(data.html);
                $form.modal();
                $('#rewikibtn').attr('disabled', true);
            },
            error: function(){
                $('#main-msg-area').html('単語の取得に失敗しました。一度、ページを更新してください。');
            }
        }).then(function(){
            bindPagingTagList();
        });
    });

    /**
     * wordの削除ボタンにclickイベントをバインド。
     */
    $('.word-del-btn').live("click", function(){
        var deleteCard = $(this).closest('div .word-card');
        var delete_id = parseInt(deleteCard.attr('word-id'));
        $.ajax({
            url: '/words/' + delete_id,
            type: 'DELETE',
            timeout: 5000,
            success: function(data){
            
                if (data.status == "success") {
                    deleteCard.slideUp("normal", function(){
                        deleteCard.remove()
                    });
                    return;
                }
                $('#main-msg-area').html('単語の削除に失敗しました。一度、ページを更新してください。');
            },
            error: function(){
                $('#main-msg-area').html('サーバエラーが発生しました。');
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
            }
        }).then(function(){
            bindPagingTagList();
        });
    });

    /**
     * wordの登録ボタンにclickイベントをバインド。
     */
    $('#word_submit').live("click", function(){
        $('#form-sending-img').html('<img src="/images/form-loader.gif">');

         var tagsLabel = "";
         $("#tag-list-for-form .tag-li .tag-label").each(function(){
             tagsLabel += $(this).text() + " ";
         });
         $("*[name=tags_label]").val(tagsLabel);
    });

    /**
     * wikipediaボタンにclickイベントをバインド。
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
                return $("#form-msg-area").text("タグにはスペースを使用できません。");
            }
            if (isAlreadySelectedTag(label, $("#tag-list-for-form .tag-li .tag-label"))) {
                return $("#form-msg-area").text("すでに選択されているタグです。");
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
    $('.tag-add-btn').live("click", function(){
        var label = $(this).closest(".tag-li").find(".tag-label").text();
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

                var $tags = $("#tag-list-for-form .tag-li");
                $tags.remove();
                $tags.each(function(){
                    addTagToForm(trim($(this).text()));
                });
            });
        });
    });

    /**
     * タグリンクにclickイベントをバインド。
     */
    $('.tag-link').live('click', function(){
    
        $(window).unbind("bottom");
        $('#list #pages').empty();
        
        $(".selected-tag").removeClass("selected-tag");
        $(this).addClass("selected-tag");
        
        var tagId = $(this).attr('tag-id');
        
        wordLoader = new WordLoader(1, tagId);
        wordLoader.loadWords().then(function(){
            bindBottomAction();
        });
    });

    /**
     * 検索ボタンにclickイベントをバインド。
     */
    $('#search-btn').live('click', function(){
    
        $(window).unbind("bottom");
        $('#list #pages').empty();
        
        $(".selected-tag").removeClass("selected-tag");
        $("[tag-id=-1]").addClass("selected-tag");
        
        var searchKey = $("#search-box").val();
        ajaxList(1, -1, searchKey).then(function(){
            bindBottomAction(searchKey);
        });
    });

    /**
     * wordカードのスペルにclickイベントをバインド。
     */
    $(".word-card .word-content .spelling").live("click", function(){
        $(this).siblings(".description").slideToggle(150);
    });

    /**
     * wordカードの開閉スイッチにclickイベントをバインド。
     */
    $("#list-switch-btn").live("click", function(){
    
        if ($(this).hasClass("open-btn")) {
        
            $(".description").css("display", "block");
            $(this).removeClass("open-btn");
            $(this).addClass("close-btn");
            $(this).children(".icon-text").text("t");
            $("#pages").removeClass("full-close");
            $("#pages").addClass("full-open");
        } else if ($(this).hasClass("close-btn")) {
        
            $(".description").css("display", "none");
            $(this).removeClass("close-btn");
            $(this).addClass("open-btn");
            $(this).children(".icon-text").text("s");
            $("#pages").removeClass("full-open");
            $("#pages").addClass("full-close");
        }
    });
});

/**
 * word新規作成ウィンドウにタグヒストリー選択エリアの表示をバインド。
 */
function bindPagingTagList(){
    $("#tag-drop-area").pajinate({
        num_page_links_to_display: 4,
        items_per_page: 8,
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
 * wordのレベルバーを読み込む。
 */
function loadLevelProgressBar(targetPage){

    var maxLevel;
    var percentOfIncrease;

    $.ajax({
        url: "/levelup_intervals/select_max_level",
        type: "GET",
        timeout: 5000,
        success: function(data){
            maxLevel = Number(data.max_level);
            percentOfIncrease = Math.round(100/maxLevel);
        },
        error: function(){
                   $('#main-msg-area').html('サーバエラーが発生しました。');
               }
    }).then(function(){
        $("[page=" + targetPage + "]" + " .word-card").each(function(){
            var level = Number($(this).attr("level"));

            var percent;
            if (level == maxLevel) {
                percent = 100;
            } else {
                percent = percentOfIncrease * level;
            }

            var $progressbar = $(this).find(".lvProgressBar");
            $progressbar.progressbar();
            $progressbar.progressbar("option", "value", percent);
        });
    });
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
 * Ajaxでwordリストを取得する。
 */
function ajaxList(nextPageNum, tag_id, searchKey){

    $('#loading-img').html('<img src="/images/ajax-loader.gif">');
    
    var paramData = {
        'page': nextPageNum
    };
    
    // 引数で指定されたtag_idが-1の場合、タグによる絞り込みを行わない。
    if (tag_id != -1) {
        paramData['tag_id'] = tag_id;
    }
    
    if (typeof searchKey !== "undefined") {
        paramData['search_key'] = searchKey;
    }
    
    return $.ajax({
        url: "/words/list",
        type: 'GET',
        data: paramData,
        timeout: 5000,
        success: function(data){
            if (data.status == 'completed') {
                $(window).unbind("bottom");
                $('#loading-img').html("");
                return;
            }
            $('#list #pages').append("<div class='list-page' page='" + nextPageNum + "'></div>");
            $('[page=' + nextPageNum + ']').append(data.html);
            $('#loading-img').html("");
        },
        error: function(){
            $('#main-msg-area').html('サーバエラーが発生しました。');
        }
    }).then(function(){
        loadLevelProgressBar(nextPageNum);
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
