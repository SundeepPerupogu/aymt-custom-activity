'use strict';

define(['postmonger'], function (Postmonger) {
    var connection = new Postmonger.Session();
    var payload = {};
    var futureUtcTime;
    var userTimeZone;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                if (key === 'futureUtcTime') {
                    futureUtcTime = val;
                    $('#futureUtcTime').val(futureUtcTime);
                }

                if (key === 'userTimeZone') {
                    userTimeZone = val;
                    $('#userTimeZone').val(userTimeZone);
                }
            });
        });
    }

    function save() {
        futureUtcTime = $('#futureUtcTime').val().trim();
        userTimeZone = $('#userTimeZone').val().trim();

        payload['arguments'].execute.inArguments = [{
            "futureUtcTime": futureUtcTime,
            "userTimeZone": userTimeZone
        }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
});
