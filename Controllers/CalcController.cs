using FinCalc.Models;
using FinCalc.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography.X509Certificates;

namespace FinCalc.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CalcController : ControllerBase
    {
        private readonly CalcService _calcService;
        public CalcController(CalcService calcService) { 
        _calcService = calcService;
        }

        [HttpPost("load")]
        public ActionResult<LoadResponse> CalculateLoan([FromBody] LoadRequest request)
        {
            try
            {
                var result = _calcService.CalculateLoan(request);
                return Ok(result);
            }
            catch (ArgumentException ex) {
                return BadRequest(new { error = ex.Message });
            }
            
        }
    }

}
