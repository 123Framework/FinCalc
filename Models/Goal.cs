namespace FinCalc.Models
{
    public class Goal
    {
        public int Id { get; set; }
        public int userId { get; set; }

        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }

        public string Title { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
