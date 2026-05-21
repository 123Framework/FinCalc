using FinCalc.Models;
using FinCalc.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinCalc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionsController : ControllerBase
    {
        private readonly TransactionService _service;
        public TransactionsController(TransactionService service)
        {
            _service = service;
        }
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateTransactionRequest request
            )
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);
            var transaction = new Transaction
            {
                Amount = request.Amount,
                Type = request.Type,
                Category = request.Category,
                Description = request.Description,
                UserId = userId,
            };
            await _service.AddAsync( transaction );
            return Ok(transaction );
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);
            var data = await _service.GetUserTransactions(userId);

            return Ok(data);
        }

    }
}
