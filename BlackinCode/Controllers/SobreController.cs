using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class SobreController : Controller
    {
        public IActionResult Sobre()
        {
            return View();
        }
    }
}
