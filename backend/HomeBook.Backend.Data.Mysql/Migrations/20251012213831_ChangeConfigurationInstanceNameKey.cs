using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeBook.Backend.Data.Mysql.Migrations
{
    /// <inheritdoc />
    public partial class ChangeConfigurationInstanceNameKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     UPDATE `Configurations`
                                     SET `Key` = 'HOMEBOOK_CONFIGURATION_NAME'
                                     WHERE `Key` = 'HOMEBOOK_INSTANCE_NAME';
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     UPDATE `Configurations`
                                     SET `Key` = 'HOMEBOOK_INSTANCE_NAME'
                                     WHERE `Key` = 'HOMEBOOK_CONFIGURATION_NAME';
                                 """);
        }
    }
}
