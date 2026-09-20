namespace HomeBook.Backend.Module.Finances.Models;

public record SavingCalculationResult(short MonthsNeeded,
    decimal MonthlyPayment,
    decimal[] Amounts,
    decimal[] Interests);
