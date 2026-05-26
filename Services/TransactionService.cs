using FinCalc.Data;
using FinCalc.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FinCalc.Services
{
    public class TransactionService
    {
        private readonly AppDbContext _context;
        public TransactionService(AppDbContext context)
        {
            _context = context;
        }
        public async Task AddAsync(Transaction transaction)
        {
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Transaction>> GetUserTransactions(int userId)
        {
            {
                return await _context.Transactions.Where(t => t.UserId == userId).OrderByDescending(t => t.CreatedAt).ToListAsync();
            }
        }
        public async Task<Transaction?> GetById(int id)
        {
            return await _context.Transactions.FirstOrDefaultAsync(t => t.Id == id);
        }
        public async Task Delete(Transaction transaction)
        {
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
    }

}

