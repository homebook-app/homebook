using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.PostgreSql.Migrations
{
    /// <inheritdoc />
    public partial class UpdateENLocale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     UPDATE "UserPreferences"
                                     SET "Value" = 'en-US'
                                     WHERE "Key" = 'LOCALE' AND "Value" = 'en-EN';
                                 """);

            migrationBuilder.Sql("""
                                     UPDATE "Configurations"
                                     SET "Value" = 'en-US'
                                     WHERE "Key" = 'HOMEBOOK_CONFIGURATION_DEFAULT_LOCALE' AND "Value" = 'en-EN';
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     UPDATE "Configurations"
                                     SET "Value" = 'en-EN'
                                     WHERE "Key" = 'HOMEBOOK_CONFIGURATION_DEFAULT_LOCALE' AND "Value" = 'en-US';
                                 """);

            migrationBuilder.Sql("""
                                     UPDATE "UserPreferences"
                                     SET "Value" = 'en-EN'
                                     WHERE "Key" = 'LOCALE' AND "Value" = 'en-US';
                                 """);
        }
    }
}
