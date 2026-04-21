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
        public ChatController(IAIService aiService)
        {
            _aiService = aiService;
        }
        [HttpPost]
        public async Task<ActionResult<ChatResponse>> Ask([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest("message is empty");
            var result = await _aiService.GetAnswerAsync(request);
            return Ok(result);
        }
        
    }
}
