using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class ContatoController : Controller
    {
        public IActionResult Contato()
        {
            return View();
        }
    }
}
