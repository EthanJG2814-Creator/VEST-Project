using Microsoft.Extensions.Logging;

namespace VEST.API
{
    /// <summary>
    /// Regulates the rate of API calls to avoid exceeding specified limits.
    /// </summary>
    /// <param name="callsPerCycle">The calls allowed in a given period.</param>
    /// <param name="cycleLength">The length of the period in seconds.</param>
    internal class Throttler(int callsPerCycle, int cycleLength) //Example: 50 calls per 60 seconds = Throttler(50, 60).
    { 
        public int CallsPerCycle { get; private set; } = callsPerCycle;
        public int CycleLength { get; private set; } = cycleLength;

        private DateTime CycleStartTime = DateTime.UtcNow;
        private int CallsThisCycle = 0;
        private readonly Lock locker = new();

        /// <summary>
        /// Enforces a rate limit by delaying execution if the number of calls exceeds the allowed threshold within a
        /// defined cycle.
        /// </summary>
        /// <remarks>
        /// This method is typically used to throttle the frequency of operations to avoid
        /// exceeding a specified call rate. If the rate limit is reached, the method delays further execution to ensure
        /// compliance with the configured cycle limits. This method is thread-safe.
        /// </remarks>
        /// <returns>A task that represents the asynchronous operation. The task completes when the rate limit check and any
        /// required delay have finished.</returns>
        public async Task Call()
        {
            int restTime = 0;
            lock (locker)
            {
                TimeSpan diff = DateTime.UtcNow - CycleStartTime;

                if (diff.TotalSeconds >= CycleLength)
                {
                    CallsThisCycle = 0;
                    CycleStartTime = DateTime.UtcNow;
                }

                CallsThisCycle++;

                if (CallsThisCycle > CallsPerCycle)
                {
                    restTime = (int)(CycleLength * 1000 - diff.TotalMilliseconds);
                    Thread.Sleep(restTime);
                    CallsThisCycle = 1;
                    CycleStartTime = DateTime.UtcNow.AddMilliseconds(restTime);
                }
            }
            if (restTime > 0)
            {
                Program.Log.LogWarning("Throttling calls for {restTime} ms.", restTime);
                await Task.Delay(restTime);
            }
        }
    }
}
