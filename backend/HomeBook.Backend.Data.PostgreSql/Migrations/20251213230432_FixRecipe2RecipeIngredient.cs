using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class FixRecipe2RecipeIngredient : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recipe2RecipeIngredient_RecipeIngredients_RecipeIngredientId",
                table: "Recipe2RecipeIngredient");

            migrationBuilder.DropIndex(
                name: "IX_Recipe2RecipeIngredient_RecipeIngredientId",
                table: "Recipe2RecipeIngredient");

            migrationBuilder.DropColumn(
                name: "RecipeIngredientId",
                table: "Recipe2RecipeIngredient");

            migrationBuilder.CreateIndex(
                name: "IX_Recipe2RecipeIngredient_IngredientId",
                table: "Recipe2RecipeIngredient",
                column: "IngredientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recipe2RecipeIngredient_RecipeIngredients_IngredientId",
                table: "Recipe2RecipeIngredient",
                column: "IngredientId",
                principalTable: "RecipeIngredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Recipe2RecipeIngredient_RecipeIngredients_IngredientId",
                table: "Recipe2RecipeIngredient");

            migrationBuilder.DropIndex(
                name: "IX_Recipe2RecipeIngredient_IngredientId",
                table: "Recipe2RecipeIngredient");

            migrationBuilder.AddColumn<Guid>(
                name: "RecipeIngredientId",
                table: "Recipe2RecipeIngredient",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Recipe2RecipeIngredient_RecipeIngredientId",
                table: "Recipe2RecipeIngredient",
                column: "RecipeIngredientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Recipe2RecipeIngredient_RecipeIngredients_RecipeIngredientId",
                table: "Recipe2RecipeIngredient",
                column: "RecipeIngredientId",
                principalTable: "RecipeIngredients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
