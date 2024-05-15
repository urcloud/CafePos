console.log("login.html이 실행되고 있음");

const form = document.querySelector(".form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const errorContainer = document.querySelector(".error-container");
const submitButton = document.querySelector("#submitBtn");

email.addEventListener("change", () => {
    clearError();
});

password.addEventListener("change", () => {
    clearError();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailValue = email.value;
    const passwordValue = password.value;
    console.log(emailValue, passwordValue);

    try {
        submitButton.classList.add("hidden");

        const resp = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: emailValue, password: passwordValue }),
        });

        const data = await resp.json();

        if (resp.ok) {
            console.log("로그인 성공", data);
            sessionStorage.setItem("userEmail", data.email);
            document.cookie = `cafe-cookie=${data.cafeCookie}; path=/`;
            window.location.href = "/admin.html";
        } else {
            console.log("로그인 실패", data);
            showError(data.message || "사용자 정보를 찾을 수 없습니다. 회원가입부터 해주세요.");
        }
    } catch (error) {
        console.log("로그인 에러:", error.message);
        showError("로그인 중 오류가 발생했습니다.");
    } finally {
        submitButton.classList.remove("hidden");
    }
});

function showError(message) {
    clearError();
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    errorContainer.appendChild(errorElement);
}

function clearError() {
    while (errorContainer.firstChild) {
        errorContainer.removeChild(errorContainer.firstChild);
    }
}