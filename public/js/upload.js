$('#create-round').submit(function (e) {
    e.preventDefault();
    console.log('test');
    var fd = new FormData($(this)[0]);
    $.ajax({
        url: '/upload',
        data: fd,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function(data){
            console.log(data);
        }
    });
});