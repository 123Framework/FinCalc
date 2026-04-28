using FinCalc.Models;
using System.Text.RegularExpressions;

namespace FinCalc.Services
{
    public class OpenAiService : IAIService
    {
        private readonly CalcService _calcService;
        public OpenAiService(CalcService calcService)
        {
            _calcService = calcService;
        }

        public async Task<ChatResponse> GetAnswerAsync(ChatRequest request)
        {
            string msg = request.Message.ToLower();
            if (IsDepositQuestion(msg))
            {
                return await HandleDepositAsync(msg);
            }
            if (IsLoanQuestion(msg))
            {
                return await HandleLoanAsync(msg);
            }
            return new ChatResponse
            {
                Answer = "Я финансовый AI-ассистент Я могу рассчитывать кредит или депозит например: 'вложить 500000 под 12% на 12 месяцев'"
            };

            /*string answer = msg switch
            {
                var m when m.Contains("budget") || m.Contains("бюджет") => "Используй правило 50/30/20: 50% обязательные расходы, 30% желания, 20% накопления",
                var m when m.Contains("credit") || m.Contains("кредит") => "Перед кредитом оцени переплату и ежемесячынй платеж",
                var m when m.Contains("save") || m.Contains("накоп") => "Сначала откладывай, потои трать. Автоматизируй накопления",
                _ => "я финансовый AI ассистент. Спроси меня про ююджет, кредиты , накопления"
            };*/

        }
        private bool IsDepositQuestion(string msg)
        {
            return msg.Contains("депозит")
                    || msg.Contains("вклад")
                    || msg.Contains("влож")
                    || msg.Contains("накоп");
        }
        private bool IsLoanQuestion(string msg)
        {
            return msg.Contains("кредит")
                    || msg.Contains("займ")
                    || msg.Contains("ипотека");

        }
        private async Task<ChatResponse> HandleDepositAsync(string msg)
        {
            await Task.Delay(100);
            var numbers = ExtractNumbers(msg);

            if (numbers.Count < 3)
            {
                return new ChatResponse
                {
                    Answer = "для расчёта депозита напиши сумму, процент и срок. Например : вложить 500000 под 12% на 12 месяцев"
                };
            }
            var request = new DepositRequest
            {
                InitialAmount = (decimal)numbers[0],
                AnnualInterestRate = numbers[1],
                Months = (int)numbers[2],
            };
            var result = _calcService.CalculateDeposit(request);
            return new ChatResponse
            {
                Answer = $"Ecли вложить {request.InitialAmount:N0} под {request.AnnualInterestRate}% на {request.Months} мес., итоговая сумма будет {result.FinalAmount:N2}. Прибыль: {result.Profit:N2}"
            };

        }
        private async Task<ChatResponse> HandleLoanAsync(string msg)
        {
            await Task.Delay(100);
            var numbers = ExtractNumbers(msg);

            if (numbers.Count < 3)
            {
                return new ChatResponse
                {
                    Answer = "для расчёта кредита напиши сумму, процент и срок. Например : кредит 1000000 под 18% на 24 месяца"
                };
            }
            var request = new LoanRequest
            {
                LoanAmount = (decimal)numbers[0],
                AnnualInterestRate = numbers[1],
                Months = (int)numbers[2],
            };
            var result = _calcService.CalculateLoan(request);

            return new ChatResponse
            {
                Answer = $"кредит {request.LoanAmount:N0} под {request.AnnualInterestRate}% на {request.Months}мес.: ежемесячный платёж {result.MonthlyPayment:N2}, общая выплата {result.TotalPayment:N2}, переплата {result.OverPayment:N2}"
            };
        }
        private List<double> ExtractNumbers(string text)
        {
            return Regex.Matches(text, @"\d+([.,]\d+)?").Select(m => double.Parse(m.Value.Replace(",", "."), System.Globalization.CultureInfo.InvariantCulture)).ToList();
        }
    }
}

