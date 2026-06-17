
using FinCalc.Data;
using FinCalc.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace FinCalc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GoalsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public GoalsController(AppDbContext context) {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetGoals()
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);
            var goals = await _context.Goals.Where(g => g.userId == userId).OrderByDescending(g => g.CreatedAt).ToListAsync();
            return Ok(goals);

        }
        [HttpPost]
        public async Task<IActionResult> CreateGoal(CreateGoalRequest request)
        {
            var userId = int.Parse(User.FindFirst("userId")!.Value);
            var goal = new Goal
            {
                Title = request.Title,
                TargetAmount = request.TargetAmount,
                CurrentAmount = request.CurrentAmount,
                userId = userId
            };
            _context.Goals.Add(goal);
            await _context.SaveChangesAsync();
            return Ok(goal);

        }
    }
}
