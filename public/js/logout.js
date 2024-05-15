const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {
    try {
        const resp = await fetch("/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await resp.json();

        if (resp.ok) {
            console.log("로그아웃 성공", data);
            sessionStorage.clear();
            window.location.href = "/";
        } else {
            console.log("로그아웃 실패", data);
        }
    } catch (error) {
        console.log("로그아웃 에러:", error.message);
    }
});