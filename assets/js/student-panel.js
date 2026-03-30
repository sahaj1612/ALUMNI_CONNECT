function show(id){

let sections = document.querySelectorAll(".section")
let links = document.querySelectorAll("[data-section-link]")

sections.forEach(sec => sec.classList.remove("active"))
links.forEach(link => link.classList.remove("active-link"))

document.getElementById(id).classList.add("active")

const activeLink = document.querySelector(`[data-section-link="${id}"]`)
if(activeLink){
activeLink.classList.add("active-link")
}

}

const initialSection = document.body.dataset.activeSection || "dashboard"
show(initialSection)
