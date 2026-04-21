using FinCalc.Models;

namespace FinCalc.Services
{
    public class CalcService
    {
        public LoadResponse CalculateLoan(LoadRequest request)
        {
            if (request.LoanAmount <= 0)
            {
                throw new ArgumentException("сумма кредита должна быть больше 0 ");
            }
            if (request.Months <= 0) throw new ArgumentException("Срок кредита должен быть больше 0");
            if (request.AnnualInterestRate < 0) throw new ArgumentException("Процентная ставка не может быть отрицательной");

            if (request.AnnualInterestRate == 0)
            {
                decimal monthlyPaymentZero = Math.Round(request.LoanAmount / request.Months, 2);
                decimal totalPaymentZero = Math.Round(monthlyPaymentZero*request.Months,2);
                decimal overpaymentZero = totalPaymentZero - request.LoanAmount;
                return new LoadResponse
                {
                    MonthlyPayment = monthlyPaymentZero,
                    TotalPayment = totalPaymentZero,
                    OverPayment = overpaymentZero
                };
            }
            double monthlyRate = request.AnnualInterestRate / 12.0 / 100.0;
            double annuityPayment = (double)request.LoanAmount * (monthlyRate * Math.Pow(1 + monthlyRate, request.Months)) / (Math.Pow(1 + monthlyRate, request.Months) - 1);

            decimal monthlyPayment = Math.Round((decimal)annuityPayment, 2);
            decimal totalPayment = Math.Round(monthlyPayment * request.Months, 2);
            decimal overpayment = Math.Round(totalPayment - request.LoanAmount, 2);

            return new LoadResponse
            {
                MonthlyPayment = monthlyPayment,
                TotalPayment = totalPayment,
                OverPayment = overpayment
            };


        }
    }
}
