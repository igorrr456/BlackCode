using BlackinCode.Interfaces;
using BlackinCode.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;

namespace BlackinCode.Controllers
{
    public class UsuarioController : Controller
    {
        private readonly IUsuarioRepositorio _usuarioRepositorio;

        public UsuarioController(IUsuarioRepositorio usuarioRepositorio)
        {
            _usuarioRepositorio = usuarioRepositorio;
        }

        [HttpGet]
        public IActionResult Logar() => View();
        [HttpPost]
        [ValidateAntiForgeryToken]

        public async Task<IActionResult> Logar(Usuario model)
        {
            if (!ModelState.IsValid) return View(model);
            var usuario = _usuarioRepositorio.Validar(model.Email, model.Senha);
            if (usuario != null)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, usuario.Nome),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim("NivelAcesso",usuario.Nivel),
                    new Claim("UsuarioId",usuario.Id.ToString())
                };
                var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), new AuthenticationProperties { IsPersistent = false });
                return RedirectToAction("Index", "Home");
            }
            ModelState.AddModelError("", "E-mail ou senha Invalidos.");
            return View(model);
        }

        public async Task<IActionResult> Sair()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Logar");
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
