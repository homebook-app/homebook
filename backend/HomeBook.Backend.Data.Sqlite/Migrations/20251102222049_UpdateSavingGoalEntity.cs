using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.Sqlite.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSavingGoalEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Icon",
                table: "SavingGoals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InterestRate",
                table: "SavingGoals",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "InterestRateOption",
                table: "SavingGoals",
                type: "text",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyPayment",
                table: "SavingGoals",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Icon",
                table: "SavingGoals");

            migrationBuilder.DropColumn(
                name: "InterestRate",
                table: "SavingGoals");

            migrationBuilder.DropColumn(
                name: "InterestRateOption",
                table: "SavingGoals");

            migrationBuilder.DropColumn(
                name: "MonthlyPayment",
                table: "SavingGoals");
        }
    }
}
