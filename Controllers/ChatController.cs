using FinCalc.Models;
using FinCalc.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinCalc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly ChatService _chatService;

        public ChatController(IAIService aiService, ChatService chatService)
        {
            _aiService = aiService;
            _chatService = chatService;
        }
        [HttpPost]
        public async Task<ActionResult<ChatResponse>> Ask([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest("message is empty");

            await _chatService.SaveMessageAsync(request.Message, "user");
            var result = await _aiService.GetAnswerAsync(request);
            await _chatService.SaveMessageAsync(result.Answer, "bot");
            return Ok(result);
        }
        [HttpGet("history")]
        public ActionResult<List<ChatMessage>> GetHistory()
        {
            var messages = _chatService.GetAll();
            return Ok(messages);
        }
        
    }
}
