$(() => {
  $("#form").fadeIn();
  attachButtonListener();
});

let loops = 0;

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
  const nameUrl = encodeURIComponent(name);
  $.getJSON(`bible/${nameUrl}`).done((result: any) => {
    handleResult(result, name);
  });
}

function handleResult(result: any, name: string) {
  console.log(result);
  loops += 1;
  const dots = loops % 5;
  if (result.status !== "done" && result.status !== "error") {
    // Is working
    let workString = "Creation is underway";
    for (let i = 0; i < dots; i++) {
      workString += ".";
    }
    $("#form").hide();
    $("#working").html(workString).show();
    $("#download").hide();
    setTimeout(() => getBible(name), 1000);
  } else if (result.status === "done") {
    // Is done
    $("#link").html(
      `<a href="${result.url}" target="_blank">Download bible</a>`
    );
    $("#form").hide();
    $("#working").hide();
    $("#download").show();
  }
}
