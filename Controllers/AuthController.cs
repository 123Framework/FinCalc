using FinCalc.Data;
using FinCalc.Models;
using FinCalc.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinCalc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuthService _authService;

        public AuthController(AppDbContext context, AuthService authService)
        {
            _authService = authService;
            _context = context;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            if (_context.Users.Any(u => u.Username == request.Username)) return BadRequest("User exists");
            var user = new User
            {
                Username = request.Username,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request) {
            var user = _context.Users.FirstOrDefault(u => u.Username == request.Username);
            if ( user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized(new {error = "Invalid credentials" });
            var token = _authService.GenerateToken(user);
            return Ok(new { token });

        }

    }
}
