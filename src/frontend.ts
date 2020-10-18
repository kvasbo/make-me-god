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
  $(".reset").on("click", () => {
    location.reload();
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
  if (result.status !== "done" && result.status !== "error") {
    // Is working
    let workString = "Working";
    for (let i = 0; i < loops; i++) {
      workString += ".";
    }
    $("#form").hide();
    $("#working").html(workString).show();
    $("#download").hide();
    setTimeout(() => getBible(name), 1000);
  } else if (result.status === "done") {
    // Is done
    $("#link").html(
      `<a href="${result.url}" target="_blank">Download bible</a> (<span style="text-decoration: underline; color: #777777" class="reset">make another</span>)`
    );
    $("#form").hide();
    $("#working").hide();
    $("#download").show();
  }
}
