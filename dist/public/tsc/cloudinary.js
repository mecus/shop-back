const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dxxw6jfih/image/upload";
const CLOUDINARY_PRESET = "n8u92z6h";

$("#loadimage").change((e) => {
    // console.log(e.target.files[0]);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    // formData.append('upload_preset', CLOUDINARY_PRESET);
    console.log(formData);
    $.ajax({
        url: "/upload",
        type: "POST",
        data: file,
        async: false,
        success: (data) => {
            console.log(data);
        },
        cache: false,
        contentType: false,
        processData: false
    });
});