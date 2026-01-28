using Microsoft.Extensions.Logging;

namespace VEST
{
    internal class Program
    {
        /// <summary>
        /// Main logger for the program. If there is any logging to be done, use this logger.
        /// </summary>
        public static readonly ILogger Log;

        static Program()
        {
            using ILoggerFactory factory = LoggerFactory.Create(builder => builder.AddConsole());
            Log = factory.CreateLogger("Program");
        }
        static void Main(string[] args)
        {
            
        }
    }
}
