function studentLogin(){

fetch("api/student/login.php",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
usn:document.getElementById("susn").value,
email:document.getElementById("semail").value,
password:document.getElementById("spassword").value
})
})
.then(res=>res.json())
.then(data=>{
alert(data.message);
});

}

function alumniLogin(){

fetch("api/alumni/login.php",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email:document.getElementById("aemail").value,
password:document.getElementById("apassword").value
})
})
.then(res=>res.json())
.then(data=>{
if(data.status === "success" && data.redirect){
window.location.href = data.redirect;
return;
}
alert(data.message);
});
}

function openModal(){
document.getElementById("loginModal").style.display="flex";
}

function closeModal(){
document.getElementById("loginModal").style.display="none";
backChoice();
}

function showStudent(){
document.getElementById("loginChoice").style.display="none";
document.getElementById("studentLogin").style.display="block";
}

function showAlumni(){
document.getElementById("loginChoice").style.display="none";
document.getElementById("alumniLogin").style.display="block";
}

function backChoice(){
document.getElementById("loginChoice").style.display="block";
document.getElementById("studentLogin").style.display="none";
document.getElementById("alumniLogin").style.display="none";
}