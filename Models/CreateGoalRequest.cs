namespace FinCalc.Models
{
    public class CreateGoalRequest
    {
        public string Title { get; set; } = "";
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
    }
}
