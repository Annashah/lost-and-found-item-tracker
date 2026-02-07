
document.addEventListener("DOMContentLoaded", function () {

    const form = document.querySelector("login-form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const userValue = username.value.trim();
        const passValue = password.value.trim();
        if (userValue === "" || passValue === "") {
            alert("Please fill all fields!");
            return;
        }
        const demoUser = "sirayiki";
        const demoPass = "12345";

        if (userValue === demoUser && passValue === demoPass) {
            alert("Login Successful!");
            window.location.href = "tracker.html";
        } else {
            alert("Invalid username or password!");
        }
    });
});
