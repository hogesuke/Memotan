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

WordLoader.prototype.loadWords = function(){

    //var nextPageNumber = this.nextPageNumber;

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
    
    return $.ajax({
        url: "/words/list",
        type: 'GET',
        data: param,
        timeout: 5000,
        success: function(data){
            if (data.status == 'completed') {
                $(window).unbind("bottom");
                $('#loading-img').html("");
                return;
            }
            $('#list #pages').append("<div class='list-page' page='" + data.page + "'></div>");
            $('[page=' + data.page + ']').append(data.html);
            $('#loading-img').html("");
            this.nextPageNumber++;
        },
        error: function(){
            $('#status').html('サーバエラーが発生しました。');
        }
    }).then(function(){
        loadLevelProgressBar(this.nextPageNumber);
    });
};

var wordLoader;

$(function(){
    countAllTestWords();
    loadLevelProgressBar(1);
    wordLoader = new  WordLoader(2);

    bindBottomAction();
});

$(function(){
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
                $('#status').html('サーバエラーが発生しました。');
            }
        }).then(function(){
            bindPagingTagList();
        });
    });

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
                $('#status').html('サーバエラーが発生しました。');
            }
        }).then(function(){
            bindPagingTagList();
        });
    });
});

$(function(){
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
                $('#status').html('削除に失敗しました。');
            },
            error: function(){
                $('#status').html('サーバエラーが発生しました。');
            },
            beforeSend: function(xhr){
                xhr.setRequestHeader("X-CSRF-Token", $("*[name=csrf-token]").attr("content"));
            }
        }).then(function(){
            bindPagingTagList();
        });
    });
});

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

$(function(){
    $('#word_submit').live("click", function(){
        $('#sending-img').html('<img src="/images/ajax-loader.gif">');
        
        var tagsLabel = "";
        $("#tag-list-for-form .tag-li .tag-label").each(function(){
            tagsLabel += $(this).text() + " ";
        });
        $("*[name=tags_label]").val(tagsLabel);
    });
});


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

$(function(){
    $('#wikibtn').live("click", function(){
        $('#status').html('通信中...');
        var subject = $('#word_spelling').val();
        $.ajax({
            url: 'http://ja.wikipedia.org/w/api.php?action=parse&page=' + encodeURIComponent(subject) + '&format=json',
            type: 'GET',
            dataType: 'jsonp',
            timeout: 5000,
            jsonp: 'callback',
            success: function(data){
                try {
                    var text = data.parse.text["*"];
                } 
                catch (e) {
                    $('#status').html('記事を取得できませんでした。');
                    return;
                }
                
                var matchedText = text.match(/<\/table>\n<p>([\w\W]*?)<\/p>\n<table id="toc" class="toc">/m);
                var extractedText = RegExp.$1;
                if (matchedText == null) {
                    $('#status').html('記事を取得できませんでした。2');
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
                $('#status').html('wikipediaから記事を取得しました！');
            },
            error: function(){
                $('#status').html('サーバエラーが発生しました。');
            }
        });
    });

    $('#rewikibtn').live("click", function(){
        var sentence = wikipediaArticleHolder.getSentence();
        var $wordDescription = $('#word_description');
        $wordDescription.attr("value", $wordDescription.attr("value") + sentence);
        if (wikipediaArticleHolder.isOver()) {
            $('#rewikibtn').attr('disabled', true);
        }
    })
});

$(function(){
    $("#tag-text-box").live("keypress", function(e) {
        if(e.which == 13) {
            var label = $(this).val();
            if (label == "") {
                return;
            }
            if (label.match(/\s/)) {
                /* TODO スペースを含む場合のメッセージ表示処理を追加すること */
                return;
            }
            if (isAlreadySelectedTag(label, $("#tag-list-for-form .tag-li .tag-label"))) {
                return;
            }

            addTagToForm(label);
            $(this).val("");
        }
    });

    $("#tag-text-box").live("focus", function() {
        if($(this).val() == $(this).attr('default-value')){
            $(this).val('');
            $(this).removeClass("empty");
        }
    })
    $("#tag-text-box").live("blur", function() {
        if(jQuery.trim($(this).val()) == "") {
            $(this).val($(this).attr('default-value'));
            $(this).addClass("empty");
        }
    });
});

function addTagToForm(tagLabel) {
    var charCount = 0;
    var $firstLineTags = $("#tag-list-1st-line .tag-li");

    $firstLineTags.each(function(){
        charCount += $(this).children(".tag-label").text().length;
    });

    var addhtml = $("#tmpl-of-tag-li").tmpl({
        label: tagLabel
    });

    var newTagSpace = tagLabel.length + 2;
    var currentTagSpace = charCount + $firstLineTags.size() * 2;
    if (24 - (newTagSpace + currentTagSpace) >= 0) {
        $("#tag-list-1st-line").append(addhtml);
    } else {
        $("#tag-list-2nd-line").append(addhtml);
    }
}

$(function(){
    $('.tag-add-btn').live("click", function(){
        var label = $(this).closest(".tag-li").find(".tag-label").text();
        if (isAlreadySelectedTag(label, $("#tag-list-for-form .tag-li .tag-label"))) {
            return;
        }
        addTagToForm(label);
    });

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
});

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

$(function(){
    $('.tag-link').live('click', function(){
    
        $(window).unbind("bottom");
        $('#list #pages').empty();
        
        $(".selected-tag").removeClass("selected-tag");
        $(this).addClass("selected-tag");
        
        var tagId = $(this).attr('tag-id');
        
        wordLoader = new  WordLoader(1, tagId);
        wordLoader.loadWords().then(function(){
            bindBottomAction();
        });
    });
});

$(function(){
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
});

$(function(){
    $(".word-card .word-content .spelling").live("click", function(){
        $(this).siblings(".description").slideToggle(150);
    });
});

$(function(){
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
                   $('#status').html('サーバエラーが発生しました。');
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
            $('#status').html('サーバエラーが発生しました。');
        }
    }).then(function(){
        loadLevelProgressBar(nextPageNum);
    });
}

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
