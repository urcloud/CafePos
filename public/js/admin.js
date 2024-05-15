document.addEventListener("DOMContentLoaded", async function () {
    const userEmail = sessionStorage.getItem("userEmail");
    const ContainerElem = document.getElementById("container");
  
    if (!userEmail) {
      if (ContainerElem) {
        ContainerElem.style.display = "none";
      }
      alert('로그인 상태가 아닙니다. 기능을 사용할 수 없습니다.');
      return;
    }
  
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', async function (event) {
        event.preventDefault();
  
        const errorElem = document.querySelector(".error");
        errorElem.innerHTML = "";
  
        const name = document.querySelector("#name").value;
        const price = document.querySelector("#price").value;
        const imageInput = document.querySelector("#image");
  
        if (!name || !price || !imageInput.files[0]) {
          errorElem.innerHTML = '누락된 입력사항이 있습니다. 확인 후 다시 시도해주세요.';
          return;
        }
  
        const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
        const extension = imageInput.files[0].name.split('.').pop().toLowerCase();
  
        if (!allowedExtensions.includes("." + extension)) {
          errorElem.innerHTML = '호환되지 않는 이미지 파일 형식입니다.';
          errorElem.style.color = 'red';
          return;
        }
  
        console.log(name, price);
  
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("image", imageInput.files[0]);
        formData.append("imageFileName", imageInput.files[0].name);
        console.log("form data:", [...formData]);
  
        try {
          const resp = await fetch("/admin", {
            method: "POST",
            body: formData,
          });
  
          if (resp.status !== 200) {
            const errorElem = document.querySelector(".error");
            const data = await resp.json();
            errorElem.innerHTML = data.error || "잘못된 형식을 입력했습니다.";
            throw new Error(data.error || "잘못된 형식을 입력했습니다.");
          }
  
          const data = await resp.json();
          console.log("result", data);
  
          const successMessageElem = document.querySelector('.success-message');
          if (successMessageElem) {
            successMessageElem.innerHTML = '업로드에 성공했습니다.';
          }
  
          resetForm();
        } catch (error) {
          console.log(error);
        }
      });
    }
  
    function resetForm() {
      document.querySelector("#name").value = "";
      document.querySelector("#price").value = "";
      document.querySelector("#image").value = "";
    }

    const menuContainer = document.getElementById("menu-list");

    try {
      const menuResponse = await fetch("/menuitems");
      const menuData = await menuResponse.json();
  
      console.log("메뉴 응답 데이터:", menuData);
  
      if (Array.isArray(menuData.menuItems)) {
        menuData.menuItems.forEach((menuItem) => {
          const menuItemDiv = document.createElement("div");
          menuItemDiv.classList.add("menu-item");
  
          const nameElement = document.createElement("h3");
          nameElement.textContent = menuItem.name;
  
          const priceElement = document.createElement("p");
          priceElement.textContent = `가격: ${menuItem.price}원`;
  
          const imageElement = document.createElement("img");
          imageElement.src = `${menuItem.imagePath}`;
          imageElement.alt = menuItem.name;
  
          menuItemDiv.appendChild(nameElement);
          menuItemDiv.appendChild(priceElement);
          menuItemDiv.appendChild(imageElement);
  
          menuItemDiv.addEventListener("click", async () => {
            const confirmDeletion = confirm(`정말로 '${menuItem.name}' 메뉴를 삭제하시겠습니까?`);
  
            if (confirmDeletion) {
              try {
                const response = await fetch("/delete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ name: menuItem.name }),
                });
  
                if (response.status === 200) {
                  console.log("메뉴 삭제 성공");
                  menuItemDiv.remove();
                } else {
                  const data = await response.json();
                  console.error("메뉴 삭제 실패:", data.error);
                }
              } catch (error) {
                console.error("메뉴 삭제 중 오류 발생:", error);
              }
            }
          });
  
          menuContainer.appendChild(menuItemDiv);
        });
      } else {
        console.error("메뉴 항목이 올바르지 않습니다.");
      }
    } catch (error) {
      console.log(error);
      errorElem.innerHTML = "서버와의 통신 중 오류가 발생했습니다.";
    }
  });