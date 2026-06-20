namespace SmartApiary.ITSimulator.UI
{
    public class ConsoleUI
    {
        public static void PrintHeader()
        {
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("======================================");
            Console.WriteLine("   SMART SCALE SIMULATOR v1.0   ");
            Console.WriteLine("======================================\n");
            Console.ResetColor();
        }
        public static void PrintError(string message)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] [ERROR] {message}");
            Console.ResetColor();
        }
    }
}
