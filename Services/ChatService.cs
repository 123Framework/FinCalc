using FinCalc.Data;
using FinCalc.Models;

namespace FinCalc.Services
{
    public class ChatService
    {
        private readonly AppDbContext _context;
        public ChatService(AppDbContext context)
        {
            _context = context;
        }


        public async Task SaveMessageAsync(string text, string type)
        {
            var messages = new ChatMessage
            {
                Text = text,
                Type = type
            };
            _context.ChatMessages.Add(messages);
            await _context.SaveChangesAsync();
        }

        public List<ChatMessage> GetAll()
        {
            return _context.ChatMessages.OrderBy(m => m.CreatedAt).ToList();
        }
    }
}
