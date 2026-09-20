namespace HomeBook.Backend.Module.Finances.Responses;

public record CalculatedSavingResponse(short MonthsNeeded,
    decimal MonthlyPayment,
    decimal[] Amounts,
    decimal[] Interests);
