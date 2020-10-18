$(() => {
    $("#form").fadeIn();
    attachButtonListener();
});
function attachButtonListener() {
    $("#submit").on("click", () => {
        const name = $("#name").val().toString();
        if (name.length > 1) {
            getBible(name);
        }
    });
}
function getBible(name) {
    const nameUrl = encodeURIComponent(name);
    $.getJSON(`bible/${nameUrl}`).done((result) => {
        handleResult(result, name);
    });
}
function handleResult(result, name) {
    console.log(result);
    if (result.status !== "done" && result.status !== "error") {
        $("#form").hide();
        $("#working").show();
        $("#download").hide();
        setTimeout(() => getBible(name), 1000);
    }
    else {
        $("#link").html(`<a href="${result.url}" target="_blank">Download bible</a>`);
        $("#form").hide();
        $("#working").hide();
        $("#download").show();
    }
}
