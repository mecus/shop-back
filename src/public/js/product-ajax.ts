// This code is not in use at the moment //
const depart = document.getElementById("department");
const aisle = document.getElementById("aisle");
const category = document.getElementById("category");
const aisleUrl = "/api/aisle";
$("#department").change((e) => {
    const val = e.target["value"];
    // console.log(val);
    $.get(aisleUrl, (data) => {
        // aisles = data;
        const aisleContent = document.getElementById("aisleContent");
        const select = document.createElement("select");
        select.setAttribute("value", "depart_id");
        const opt = document.createElement("option");
        data.forEach(val => {
            opt.setAttribute("value", "yes");
            opt.innerHTML = `Ginger`;
            select.appendChild(opt);
        });
        setTimeout(() => {
            aisleContent.appendChild(select);
            console.log(aisleContent);
        }, 500);
    });
});