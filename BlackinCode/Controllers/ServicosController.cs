using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class ServicosController : Controller
    {
        public IActionResult Servicos()
        {
            return View();
        }
    }
}
