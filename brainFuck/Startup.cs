using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(brainFuck.Startup))]
namespace brainFuck
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
