namespace FinCalc.Models
{
    public class DepositRequest
    {
        public decimal InitialAmount { get; set; }
        public double AnnualInterestRate { get; set; }
        public int Months { get; set; }
    }
}
