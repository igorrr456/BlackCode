using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class SobreController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
