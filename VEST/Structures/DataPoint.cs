namespace VEST.Structures
{
    /// <summary>
    /// This struct represents a single data point in time for the dog, containing various health metrics.
    /// </summary>
    public readonly struct DataPoint(DateTime timestamp, int bpm, float temperature)
    {
        public readonly DateTime Timestamp = timestamp;
        public readonly int Bpm = bpm;
        public readonly float Temperature = temperature;
        /*Todo: Add other health metrics that are needed as they come up.*/
    }
}
