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

function getBible(name: string) {
  // Start
  $.getJSON(`bible/${name}`).done((result: any) => {
    handleResult(result, name);
  });
}

function handleResult(result: any, name: string) {
  console.log(result);
  if (result.status !== "done" && result.status !== "error") {
    // Keep running every second
    setTimeout(() => getBible(name), 1000);
  } else {
    console.log("done!");
  }
}
