function show(id){
let sections = document.querySelectorAll(".section");
let links = document.querySelectorAll("[data-section-link]");

sections.forEach(sec => sec.classList.remove("active"));
links.forEach(link => link.classList.remove("active-link"));

document.getElementById(id).classList.add("active");

const activeLink = document.querySelector(`[data-section-link="${id}"]`);
if(activeLink){
activeLink.classList.add("active-link");
}
}

document.querySelectorAll('select[name="status"]').forEach(function(select){
const cell = select.closest('tr').children[4];
if(cell){
select.value = cell.textContent.trim();
}
});

const initialSection = document.body.dataset.activeSection || "dashboard";
show(initialSection);
