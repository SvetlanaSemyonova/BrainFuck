namespace brainFuck.Models
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;

    public partial class FileDbContext : DbContext
    {
        public FileDbContext()
            : base("name=FileDbContext")
        {
        }

        public virtual DbSet<File> Files { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<File>()
                .Property(e => e.UserId)
                .IsFixedLength();

            modelBuilder.Entity<File>()
                .Property(e => e.Name)
                .IsUnicode(false);

            modelBuilder.Entity<File>()
                .Property(e => e.Text)
                .IsUnicode(false);
        }
    }
}
