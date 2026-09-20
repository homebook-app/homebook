using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.PostgreSql.Migrations
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
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InterestRate",
                table: "SavingGoals",
                type: "numeric",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InterestRateOption",
                table: "SavingGoals",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyPayment",
                table: "SavingGoals",
                type: "numeric",
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
