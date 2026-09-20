using HomeBook.Backend.Module.Finances.Models;
using HomeBook.Backend.Module.Finances.Responses;

namespace HomeBook.Backend.Module.Finances.Mappings;

public static class CalculationMappings
{
    public static CalculatedSavingResponse ToResponse(this SavingCalculationResult r) =>
        new(r.MonthsNeeded,
            r.MonthlyPayment,
            r.Amounts,
            r.Interests);
}
