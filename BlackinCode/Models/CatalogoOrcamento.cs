namespace BlackinCode.Models
{
    public class OpcaoOrcamento
    {
        public string Id { get; init; } = string.Empty;
        public string Rotulo { get; init; } = string.Empty;
        public decimal Valor { get; init; }
        public string Icone { get; init; } = string.Empty;
    }

    public class EtapaOrcamento
    {
        public string Id { get; init; } = string.Empty;
        public string Titulo { get; init; } = string.Empty;
        public string Resumo { get; init; } = string.Empty;
        public string? Dica { get; init; }

        // true = o usuário pode marcar várias opções
        public bool Multipla { get; init; }

        // true = os valores são o preço base (primeira pergunta); false = valores somados ("+ R$ ...")
        public bool Base { get; init; }

        public List<OpcaoOrcamento> Opcoes { get; init; } = new();
    }

    public class ItemResumoOrcamento
    {
        public string Etapa { get; init; } = string.Empty;
        public List<string> Escolhas { get; init; } = new();
        public decimal Valor { get; init; }
    }

    public class ResultadoOrcamento
    {
        public decimal Total { get; init; }
        public List<ItemResumoOrcamento> Itens { get; init; } = new();
    }

    // Única fonte de verdade dos preços. Para mudar valores, perguntas ou opções, edite só aqui.
    public static class CatalogoOrcamento
    {
        public static readonly IReadOnlyList<EtapaOrcamento> Etapas = new List<EtapaOrcamento>
        {
            new()
            {
                Id = "servico", Titulo = "Qual serviço você precisa?", Resumo = "Serviço", Base = true,
                Opcoes =
                {
                    new() { Id = "landing",  Rotulo = "Landing page",           Valor = 1500m,  Icone = "landing" },
                    new() { Id = "site",     Rotulo = "Site institucional",     Valor = 3000m,  Icone = "site" },
                    new() { Id = "loja",     Rotulo = "Loja virtual",           Valor = 6500m,  Icone = "loja" },
                    new() { Id = "sistema",  Rotulo = "Sistema web sob medida", Valor = 10000m, Icone = "sistema" }
                }
            },
            new()
            {
                Id = "fase", Titulo = "Em qual fase encontra-se o seu projeto?", Resumo = "Fase do projeto",
                Opcoes =
                {
                    new() { Id = "ideia",     Rotulo = "Ideia",            Valor = 500m, Icone = "plus" },
                    new() { Id = "definido",  Rotulo = "Projeto definido", Valor = 0m,   Icone = "chevrons" },
                    new() { Id = "andamento", Rotulo = "Em andamento",     Valor = 400m, Icone = "chart" }
                }
            },
            new()
            {
                Id = "marca", Titulo = "Já possui o Design, Logo e Marca?", Resumo = "Design, logo e marca",
                Opcoes =
                {
                    new() { Id = "sim", Rotulo = "Sim", Valor = 0m,    Icone = "check" },
                    new() { Id = "nao", Rotulo = "Não", Valor = 1200m, Icone = "x" }
                }
            },
            new()
            {
                Id = "paginas", Titulo = "Quantas telas ou páginas terá o projeto?", Resumo = "Telas e páginas",
                Opcoes =
                {
                    new() { Id = "ate5",   Rotulo = "Até 5 telas",      Valor = 0m,    Icone = "file" },
                    new() { Id = "6a10",   Rotulo = "6 a 10 telas",     Valor = 1500m, Icone = "files" },
                    new() { Id = "10mais", Rotulo = "Mais de 10 telas", Valor = 3000m, Icone = "grid" }
                }
            },
            new()
            {
                Id = "func", Titulo = "Quais funcionalidades você quer?", Resumo = "Funcionalidades",
                Multipla = true, Dica = "Marque quantas quiser.",
                Opcoes =
                {
                    new() { Id = "form",  Rotulo = "Formulário e WhatsApp",  Valor = 300m,  Icone = "mail" },
                    new() { Id = "blog",  Rotulo = "Blog",                   Valor = 800m,  Icone = "blog" },
                    new() { Id = "login", Rotulo = "Login de usuários",      Valor = 2500m, Icone = "lock" },
                    new() { Id = "pagto", Rotulo = "Pagamento online",       Valor = 2000m, Icone = "card" },
                    new() { Id = "admin", Rotulo = "Painel administrativo",  Valor = 3500m, Icone = "dash" }
                }
            },
            new()
            {
                Id = "seo", Titulo = "Quer otimização para o Google (SEO)?", Resumo = "SEO",
                Opcoes =
                {
                    new() { Id = "sim", Rotulo = "Sim", Valor = 900m, Icone = "search" },
                    new() { Id = "nao", Rotulo = "Não", Valor = 0m,   Icone = "x" }
                }
            },
            new()
            {
                Id = "prazo", Titulo = "Qual o prazo de entrega?", Resumo = "Prazo",
                Opcoes =
                {
                    new() { Id = "normal",  Rotulo = "Normal (30 a 45 dias)",  Valor = 0m,    Icone = "clock" },
                    new() { Id = "urgente", Rotulo = "Urgente (até 15 dias)", Valor = 1500m, Icone = "bolt" }
                }
            }
        };

        // Recebe { "servico": ["site"], "func": ["blog","login"], ... } e devolve o total.
        // Retorna null se algo estiver inválido (etapa de escolha única sem exatamente 1 opção, id desconhecido).
        public static ResultadoOrcamento? Calcular(Dictionary<string, List<string>>? respostas)
        {
            if (respostas is null) return null;

            var itens = new List<ItemResumoOrcamento>();

            foreach (var etapa in Etapas)
            {
                respostas.TryGetValue(etapa.Id, out var enviados);
                var ids = (enviados ?? new List<string>()).Distinct().ToList();

                if (!etapa.Multipla && ids.Count != 1) return null;

                var escolhidas = new List<OpcaoOrcamento>();
                foreach (var id in ids)
                {
                    var opcao = etapa.Opcoes.FirstOrDefault(o => o.Id == id);
                    if (opcao is null) return null;
                    escolhidas.Add(opcao);
                }

                itens.Add(new ItemResumoOrcamento
                {
                    Etapa = etapa.Resumo,
                    Escolhas = escolhidas.Select(o => o.Rotulo).ToList(),
                    Valor = escolhidas.Sum(o => o.Valor)
                });
            }

            return new ResultadoOrcamento { Total = itens.Sum(i => i.Valor), Itens = itens };
        }
    }
}
