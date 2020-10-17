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

function getBible(name: string) {
  // Start
  $.getJSON(`bible/${name}`).done((result: any) => {
    handleResult(result, name);
  });
}

function handleResult(result: any, name: string) {
  console.log(result);
  if (result.status !== "done" && result.status !== "error") {
    // Is working
    $("#form").hide();
    $("#working").show();
    $("#download").hide();
    setTimeout(() => getBible(name), 1000);
  } else {
    // Is done
    $("#link").html(`<a href="${result.url}">Download bible</a>`);
    $("#form").hide();
    $("#working").hide();
    $("#download").show();
  }
}
