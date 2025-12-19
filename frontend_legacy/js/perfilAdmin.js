/**
 * Admin Profile Management
 */

const API_BASE = "http://127.0.0.1:8000/api/v1/";

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Sidebar
  if (typeof renderSidebar === "function") {
    renderSidebar("configuracion");
  }

  // Load Profile
  fetchProfile();

  // Setup Form Submit
  setupFormSubmit();
});

async function fetchProfile() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    window.location.href = "../Login.html";
    return;
  }

  try {
    const response = await fetch(API_BASE + "users/profile/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      populateForm(user);
    } else {
      if (response.status === 401) {
        Toast.show({
          type: "error",
          message: "Sesión expirada. Por favor inicia sesión nuevamente.",
        });
        setTimeout(() => (window.location.href = "../Login.html"), 1500);
      } else {
        console.error("Error fetching profile:", await response.text());
        Toast.show({ type: "error", message: "Error al cargar el perfil" });
      }
    }
  } catch (error) {
    console.error("Network error:", error);
    Toast.show({ type: "error", message: "Error de conexión" });
  }
}

function populateForm(user) {
  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("name").value = user.name || "";

  if (user.profile) {
    document.getElementById("ap_p").value = user.profile.ap_p || "";
    document.getElementById("ap_m").value = user.profile.ap_m || "";
    document.getElementById("phone_number").value =
      user.profile.phone_number || "";
    document.getElementById("shipping_address").value =
      user.profile.shipping_address || "";
    document.getElementById("billing_address").value =
      user.profile.billing_address || "";
  }
}

function setupFormSubmit() {
  document
    .getElementById("profileForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = localStorage.getItem("accessToken");

      const formData = {
        email: document.getElementById("email").value,
        name: document.getElementById("name").value,
        profile: {
          ap_p: document.getElementById("ap_p").value,
          ap_m: document.getElementById("ap_m").value,
          phone_number: document.getElementById("phone_number").value,
          shipping_address: document.getElementById("shipping_address").value,
          billing_address: document.getElementById("billing_address").value,
        },
      };

      try {
        const response = await fetch(API_BASE + "users/profile/", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          Toast.show({
            type: "success",
            message: "Perfil actualizado correctamente",
          });
        } else {
          const errorData = await response.json();
          Toast.show({
            type: "error",
            message: "Error al actualizar: " + JSON.stringify(errorData),
          });
        }
      } catch (error) {
        console.error("Network error:", error);
        Toast.show({ type: "error", message: "Error de conexión" });
      }
    });
}
