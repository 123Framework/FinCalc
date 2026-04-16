using FinCalc.Models;

namespace FinCalc.Services
{
    public interface IAIService
    {
        Task<ChatResponse> GetAnswerAsync(ChatRequest request);
    }
}
