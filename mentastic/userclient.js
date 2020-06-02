var userclient = document.getElementById("userclient")
var ucsubmit = document.getElementById("ucsubmit")

ucsubmit.addEventListener("click", function(event) {
	event.preventDefault()
	if(userclient.value == "user") {
		window.location.href = "userregister.html"
	} else {
		window.location.href = "clientregister.html"
	}
})