namespace FinCalc.Models
{
    public class LoadRequest 
    {
        public decimal LoanAmount { get; set; }
        public double AnnualInterestRate { get; set; }
        public int Months { get; set; }


    }
}
