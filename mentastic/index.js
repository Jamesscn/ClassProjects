var logo = document.getElementById("logo")

logo.addEventListener("mouseover", function() {
	logo.src = "logo_active.png"
})

logo.addEventListener("mouseleave", function() {
	logo.src = "logo.png"
})