$('.login-button').live('click', function() {
    $(this).closest('form').submit();
});
