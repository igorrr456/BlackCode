using BlackinCode.Models;
using Microsoft.AspNetCore.Mvc;

namespace BlackinCode.Controllers
{
    public class OrcamentoController : Controller
    {
        // Abre a tela do orçamento (links "Comece agora" / "Solicitar orçamento" já apontam pra cá).
        public IActionResult Index()
        {
            return View(CatalogoOrcamento.Etapas);
        }

        // Chamado pelo JavaScript no fim das perguntas. O valor é recalculado aqui,
        // então mexer nos preços pelo navegador não altera o resultado final.
        [HttpPost]
        public IActionResult Calcular([FromBody] Dictionary<string, List<string>> respostas)
        {
            var resultado = CatalogoOrcamento.Calcular(respostas);
            if (resultado is null) return BadRequest();

            return Json(resultado);
        }
    }
}
