$(function() {
    $('.login-button').live('click', function() {
        $(this).closest('form').submit();
    });

    $("#socialbuttons .twitter").socialbutton("twitter", {
        button : "horizontal",
        text   : "単語をメモするアプリ「Memotan」",
        url    : "http://www.memotan.com",
    }).width(95);

    $("#socialbuttons .facebook").socialbutton("facebook_like", {
        button : "button_count",
        url    : "http://www.memotan.com",
    }).width(110);

    $("#socialbuttons .hatena").socialbutton("hatena", {
        button : "standard",
        url    : "http://www.memotan.com",
        title  : "Memotan",
    }).width(70);
});
