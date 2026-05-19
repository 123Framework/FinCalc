namespace FinCalc.Models
{
    public class CreateTransactionRequest
    {
        public decimal Amount { get; set; }
        public string Type { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
    }
}
