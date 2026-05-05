namespace FinCalc.Models
{
    public class ChatMessage

    {
        public int Id { get; set; } 
        public string Text { get; set; }
        public string Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


    }
}
