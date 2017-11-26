const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxxw6jfih/image/upload";
const CLOUDINARY_PRESET = "n8u92z6h";
// Uploading image for the department
const upspin = document.getElementById("uploadSpin");
const done = document.getElementById("done");
const formField = document.getElementById("formField");
const imageUrl = document.createElement("input");
const publicId = document.createElement("input");
$("#loadimage").change((e) => {
    if (!e.target.files[0]) {
        return;
    }
    upspin.style.display = "block";
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file, file.filename);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    axios({
        url: CLOUDINARY_URL,
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        data: formData
    }).then((res) => {
        // console.log(res.data);
        imageUrl.setAttribute("type", "text");
        imageUrl.setAttribute("hidden", "");
        imageUrl.setAttribute("name", "image_url");
        imageUrl.setAttribute("value", res.data.secure_url);
        publicId.setAttribute("type", "text");
        publicId.setAttribute("hidden", "");
        publicId.setAttribute("name", "photo_id");
        publicId.setAttribute("value", res.data.public_id);
        formField.appendChild(imageUrl);
        formField.appendChild(publicId);
        upspin.style.display = "none";
        done.style.display = "block";
        // $.post('/upload', {image_url: res.data.secure_url, public_id: res.data.public_id }, (data, status) => {
        //     console.log("status: " + status);
        //     return;
        // });
    }).catch((err) => {
        console.log(err);
    });
});
// Uploading Image for the product
const imgAlert = document.getElementById("imageAlert");
$("#inputbox").change((e) => {
    const id = document.getElementById("prodId").innerText;
    console.log(e.target.files[0].size);
    if (e.target["files"][0].size > 38500) {
        console.log("Your file is too large");
        imgAlert.innerHTML = `<small>Image too large</small>`;
        return;
    }
    console.log("You fine is good");
    imgAlert.innerHTML = `<small>Your file is good</small>`;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file, file.filename);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    axios({
        url: CLOUDINARY_URL,
        method: 'POST',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        data: formData
    }).then((res) => {
        console.log(res);
        $.post("/products/updates", { id, image_url: res.data.secure_url, public_id: res.data.public_id }, (data, status) => {
            console.log(data);
            console.log(status);
            window.location.replace("/products/show/" + data.id);
        });
    }).catch((err) => {
        console.log(err);
    });
});
//# sourceMappingURL=image-uploader.js.map