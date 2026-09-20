using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalDataToRecipe : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DurationMinutes",
                table: "Recipes",
                newName: "DurationWorkingMinutes");

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                table: "Recipes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationCookingMinutes",
                table: "Recipes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationRestingMinutes",
                table: "Recipes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "Recipes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comments",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "DurationCookingMinutes",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "DurationRestingMinutes",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "Recipes");

            migrationBuilder.RenameColumn(
                name: "DurationWorkingMinutes",
                table: "Recipes",
                newName: "DurationMinutes");
        }
    }
}
