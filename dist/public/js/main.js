const domE = document.getElementById("dept-container");
$(document).ready(function () {
    // Place JavaScript code here...
    // $(".dropdown-button").dropdown();
});
const deleteDept = (val) => {
    const alat = confirm("Are you sure");
    if (alat) {
        $.ajax({
            url: "/department/" + val,
            type: 'DELETE'
        }).then((res) => {
            console.log(res);
            setTimeout(() => {
                window.location.reload();
            }, 100);
        });
    }
    return false;
};
const deleteAisle = (id) => {
    const alat = confirm("Are you sure");
    if (alat) {
        $.ajax({
            url: "/aisle/" + id,
            type: 'DELETE'
        }).then((res) => {
            console.log(res);
            setTimeout(() => {
                window.location.reload();
                // window.location.replace("/department");
            }, 100);
        });
    }
    return false;
};
const deleteCategory = (id) => {
    const alat = confirm("Are you sure");
    if (id && alat) {
        $.ajax({
            url: "/category/" + id,
            type: "DELETE"
        }).then(res => {
            // console.log(res);
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }, (err) => console.log(err));
    }
    return false;
};
const deleteProduct = (pid) => {
    const photoid = document.getElementById("photoId").innerText;
    const alat = confirm("Are you sure");
    if (pid && alat) {
        $.post("product/delete", { id: pid, photoId: photoid }, (data, status) => {
            console.log(data);
            window.location.replace("/products");
        });
    }
    return false;
};
//# sourceMappingURL=main.js.map