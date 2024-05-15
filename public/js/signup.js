console.log("signup.html이 실행되고 있음");

const form = document.querySelector(".form");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const password2 = document.querySelector("#password2");
const errorContainer = document.querySelector(".error-container");
const submitButton = document.querySelector("#submitBtn");

email.addEventListener("change", () => {
    clearError();
});

password.addEventListener("change", () => {
    clearError();
});

password2.addEventListener("change", () => {
    clearError();
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailValue = email.value;
    const passwordValue = password.value;
    const password2Value = password2.value;

    console.log(emailValue, passwordValue, password2Value);

    if (passwordValue !== password2Value) {
        showError("비밀번호가 일치하지 않습니다.");
        return;
    }

    try {
        submitButton.classList.add("hidden");
        //dissolved 속성이 있음

        const resp = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: emailValue, password: passwordValue }),
        });

        if (!resp.ok) {
            const errorData = await resp.json();
            throw new Error(errorData.error || "회원가입에 실패했습니다.");
        }

        const data = await resp.json();
        console.log("회원가입 성공:", data);
        window.location.href = "/login.html";

    } catch (error) {
        console.log("회원가입 에러:", error.message);
        showError(error.message || "회원가입 중 오류가 발생했습니다.");
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