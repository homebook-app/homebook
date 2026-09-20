using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.Mysql.Migrations
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
                type: "longtext",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "InterestRate",
                table: "SavingGoals",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InterestRateOption",
                table: "SavingGoals",
                type: "text",
                nullable: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MonthlyPayment",
                table: "SavingGoals",
                type: "decimal(18,2)",
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
