 using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class ProjetosController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
