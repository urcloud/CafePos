document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/menuitems");
    const responseData = await response.json();

    console.log("응답 데이터:", responseData);

    const menuContainer = document.getElementById("menu-list");
    const cartContainer = document.getElementById("cart-items");

    if (Array.isArray(responseData.menuItems)) {
      responseData.menuItems.forEach((menuItem) => {
        const menuItemDiv = document.createElement("div");
        menuItemDiv.classList.add("menu-item");

        const nameElement = document.createElement("h3");
        nameElement.textContent = menuItem.name;

        const priceElement = document.createElement("p");
        priceElement.textContent = `가격: ${menuItem.price}원`;

        const imageElement = document.createElement("img");
        imageElement.src = `${menuItem.imagePath}`;
        imageElement.alt = menuItem.name;

        console.log("여기봐봐",  menuItem.imagePath)

        menuItemDiv.appendChild(nameElement);
        menuItemDiv.appendChild(priceElement);
        menuItemDiv.appendChild(imageElement);

        menuItemDiv.addEventListener("click", () => {
          addToCart(menuItem, cartContainer);
        });

        menuContainer.appendChild(menuItemDiv);
      });
    } else {
      console.error("메뉴 항목이 올바르지 않습니다.");
    }
  } catch (error) {
    console.error("메뉴 항목을 가져오는 동안 오류 발생:", error.message);
  }
});

function addToCart(menuItem, cartContainer) {
  clearError();
  const cartItem = document.createElement("li");
  cartItem.textContent = `${menuItem.name} - ${menuItem.price}원`;

  cartContainer.appendChild(cartItem);
}

const orderButton = document.getElementById("order-button");
const cancelButton = document.getElementById("cancel-button");

function isCartEmpty() {
  const cartContainer = document.getElementById("cart-items");
  return cartContainer.children.length === 0;
}

function showError(message) {
  clearError();
  const errorMessageElement = document.getElementById("errorMessage");
  errorMessageElement.textContent = message;
}

orderButton.addEventListener("click", () => {
  if (isCartEmpty()) {
    showError("장바구니가 비어있습니다.");
  } else {
    sendOrderToServer(orderMessage);
  }
});

cancelButton.addEventListener("click", () => {
  clearCart();
});

function sendOrderToServer() {
  const cartContainer = document.getElementById("cart-items");
  const cartItems = Array.from(cartContainer.children).map((cartItem) => cartItem.textContent);
  const orderData = { items: cartItems };

  fetch("/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("주문 결과:", data);
      showOrderMessage(data.message);
      clearCart();
    })
    .catch((error) => {
      console.error("주문 실패:", error);
    });
}

function showOrderMessage(message) {
  orderMessage.textContent = message;
  setTimeout(() => {
    orderMessage.textContent = "";
  }, 3000);
}

function clearError() {
  const errorMessageElement = document.getElementById("errorMessage");
  errorMessageElement.textContent = "";
}

function clearCart() {
  const cartContainer = document.getElementById("cart-items");
  while (cartContainer.firstChild) {
    cartContainer.removeChild(cartContainer.firstChild);
  }
}