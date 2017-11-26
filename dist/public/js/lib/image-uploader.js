var CLOUDINARY_URL="https://api.cloudinary.com/v1_1/dxxw6jfih/image/upload";
var CLOUDINARY_PRESET="n8u92z6h";


function getId(id){
   localStorage.removeItem("queryId");
   localStorage.setItem("queryId", id);
}


var upload_data = document.getElementById('loadimage');

upload_data.addEventListener('change', function(event){
   var file = event.target.files[0];
   var formData = new FormData();
   formData.append('file', file);
   formData.append('upload_preset',CLOUDINARY_PRESET);

   // console.log(file);
   // console.log(localStorage.getItem("queryId"));
   axios({
       url: CLOUDINARY_URL,
       method: 'POST',
       headers: {
           'Content-type': 'application/x-www-form-urlencoded'
       },
       data: formData
   }).then(function(res){
       // console.log(res);
       $.post('/admin/upload',{data: res.data.secure_url, public_id: res.data.public_id, id:localStorage.getItem("queryId")}, function(data, status){
           console.log("status: "+status);
           window.location.replace('/admin/product/'+localStorage.getItem("queryId"));
           // localStorage.removeItem("queryId");
       });
   }).catch(function(err){
       console.log(err);
   })
});

