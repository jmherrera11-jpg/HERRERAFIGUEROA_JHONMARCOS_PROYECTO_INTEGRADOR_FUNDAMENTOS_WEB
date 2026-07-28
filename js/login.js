document.addEventListener("DOMContentLoaded", async function () {
  await DaatStorage.init("../../json/");

  const formLogin = document.getElementById("formLogin");
  const inputEmail = document.getElementById("exampleFormControlInput1");
  const inputClave = document.getElementById("inputPassword");

  formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const email = inputEmail.value.trim();
    const clave = inputClave.value.trim();

    if (email === "" || clave === "") {
      alert("Completa tu correo y contraseña.");
      return;
    }

    const usuarios = DaatStorage.obtener("usuarios");
    const usuarioEncontrado = usuarios.find(function (usuario) {
      return usuario.email.toLowerCase() === email.toLowerCase() && usuario.password === clave;
    });

    if (!usuarioEncontrado) {
      alert("El correo o la contraseña no coinciden con ningún usuario registrado.");
      return;
    }

    DaatStorage.guardarUsuarioActual(usuarioEncontrado);
    window.location.href = "../feed/inicio.html";
  });
});