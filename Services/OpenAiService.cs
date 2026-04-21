using FinCalc.Models;

namespace FinCalc.Services
{
    public class OpenAiService : IAIService
    {
        public async Task<ChatResponse> GetAnswerAsync(ChatRequest request)
        {
            string msg = request.Message.ToLower();

            string answer = msg switch
            {
                var m when m.Contains("budget") || m.Contains("бюджет") => "Используй правило 50/30/20: 50% обязательные расходы, 30% желания, 20% накопления",
                var m when m.Contains("credit") || m.Contains("кредит") => "Перед кредитом оцени переплату и ежемесячынй платеж",
                var m when m.Contains("save") || m.Contains("накоп") => "Сначала откладывай, потои трать. Автоматизируй накопления",
                _ => "я финансовый AI ассистент. Спроси меня про ююджет, кредиты , накопления"
            };
            await Task.Delay(200);
            return new ChatResponse
            {
                Answer = answer,
            };

        }
    }
}
