using BlackinCode.Models;

namespace BlackinCode.Interfaces
{
    public interface IUsuarioRepositorio
    {
        Usuario Validar(string email, string senha);
        void CriarConta(Usuario usuario);
        void DeletarConta(int id);
        Usuario BuscarPorId(int id);
        void Atualizar(Usuario usuario);
    }
}