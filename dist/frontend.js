$(() => {
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
    $.getJSON(`bible/${name}`).done((result) => {
        handleResult(result, name);
    });
}
function handleResult(result, name) {
    console.log(result);
    if (result.status !== "done" && result.status !== "error") {
        setTimeout(() => getBible(name), 1000);
    }
    else {
        console.log("done!");
    }
}
//# sourceMappingURL=frontend.js.map